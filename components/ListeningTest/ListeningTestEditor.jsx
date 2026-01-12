'use client';

import { Box, Paper, Typography, Snackbar, Alert, Backdrop, CircularProgress } from '@mui/material';
import { Image, TextFields, Edit, Link } from '@mui/icons-material';
import { useState } from 'react';
import {
  container,
  contentWrap,
  panelPaper,
  addPartBox,
} from '../../styles/Teacher/Listening/ListeningStyles';

import TestEditorHeader from '../UploadTest/TestEditorHeader';
import TestEditorActions from '../UploadTest/TestEditorActions';
import SelectPartType from './SelectPartType';
import BasicInformation from './BasicInformation';
import MultiChoiceImagePart from './MultiChoiceImagePart';
import MultiChoiceTextPart from './MultiChoiceTextPart';
import FillInTheBlankPart from './FillInTheBlankPart';
import MatchingPart from './MatchingPart';

import { validateTest, getValidationErrorMessage } from '../../utils/testValidation';
import { collectFiles, transformPartsForSubmitWithUrls } from '../../utils/testTransformers';
import {
  createTest,
  getPresignedUrl,
  uploadToObjectStorage,
  confirmUpload,
  submitTestParts,
} from '../../api/test';

const PART_TYPES = [
  {
    id: 'multichoice_images',
    icon: <Image sx={{ fontSize: 40 }} />,
    title: 'Multiple choice image',
    description: 'Students select the correct image',
  },
  {
    id: 'multichoice_texts',
    icon: <TextFields sx={{ fontSize: 40 }} />,
    title: 'Multiple choice text',
    description: 'Students select the correct text',
  },
  {
    id: 'fill_in_the_blanks',
    icon: <Edit sx={{ fontSize: 40 }} />,
    title: 'Fill in the blanks',
    description: 'Students complete missing words',
  },
  {
    id: 'matching',
    icon: <Link sx={{ fontSize: 40 }} />,
    title: 'Matching',
    description: 'Students match items together',
  },
];

export default function ListeningTestEditor() {
  const [basicInfo, setBasicInfo] = useState({
    testName: '',
    level: '',
    time: '',
    description: '',
  });
  const [parts, setParts] = useState([]);
  const [errors, setErrors] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' });
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  const handleBasicInfoChange = (field, value) => {
    setBasicInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddPart = () => {
    setParts((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        type: null,
      },
    ]);
  };

  const handleCancelPart = (partId) => {
    setParts((prev) => prev.filter((p) => p.id !== partId));
  };

  const handleSelectPartType = (partId, type) => {
    setParts((prev) =>
      prev.map((p) => {
        if (p.id !== partId) return p;
        if (type === 'multichoice_texts') {
          return { ...p, type, audioFormat: p.audioFormat || 'onetoone' };
        }
        return { ...p, type };
      }),
    );
  };

  const handleSubmit = async (status) => {
    setIsSaving(true);
    const validationErrors = validateTest(basicInfo, parts);
    if (validationErrors) {
      setErrors(validationErrors);
      const errorMessage = getValidationErrorMessage(validationErrors);
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
      setIsSaving(false);
      return;
    }
    setErrors(null);

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setSnackbar({ open: true, message: 'Authentication required', severity: 'error' });
        setIsSaving(false);
        return;
      }

      const basicInfoData = {
        title: basicInfo.testName,
        level: basicInfo.level,
        skill: 'L',
        time: parseInt(basicInfo.time),
        description: basicInfo.description,
        status: status === 'Draft' ? 'D' : status === 'In review' ? 'I' : 'P',
      };

      const response = await createTest(basicInfoData, token);
      const testId = response.id;

      const files = collectFiles(parts);
      const filenameToUrl = {};
      for (const f of files) {
        const presign = await getPresignedUrl(
          {
            filename: f.filename,
            fileSize: f.fileSize ?? f.file?.size,
            mimeType: f.mimeType ?? f.file?.type,
            category: 'tests',
            testId,
            part: f.partOrder,
          },
          token,
        );

        const uploadResult = await uploadToObjectStorage({
          url: presign.url,
          fields: presign.fields,
          file: f.file,
        });
        const confirm = await confirmUpload(
          {
            key: presign.key,
            fileSize: f.fileSize ?? f.file?.size,
            mimeType: f.mimeType ?? f.file?.type,
            etag: uploadResult.etag,
          },
          token,
        );

        filenameToUrl[f.filename] = confirm.file_url || presign.url;
      }

      const preparedParts = transformPartsForSubmitWithUrls(parts, filenameToUrl);
      await submitTestParts({ testId, parts: preparedParts, token });

      setSnackbar({ open: true, message: `Test ${status} successfully!`, severity: 'success' });

      setBasicInfo({ testName: '', level: '', time: '', description: '' });
      setParts([]);
      setErrors(null);
      setIsSaving(false);
    } catch (error) {
      setSnackbar({ open: true, message: `Submit failed: ${error.message}`, severity: 'error' });
      setIsSaving(false);
    }
  };

  return (
    <Box sx={container}>
      <Box sx={{ filter: isSaving ? 'blur' : 'none' }}>
        <TestEditorHeader
          title="Create New Listening Test"
          description="Fill in the details below to create a new listening test for your students"
        />
        <TestEditorActions
          onPreview={() => setShowPreview(!showPreview)}
          isPreviewActive={showPreview}
          onSendReview={() => handleSubmit('In review')}
          onSaveDraft={() => handleSubmit('Draft')}
          onPublish={() => handleSubmit('Published')}
        />
        <Box sx={contentWrap}>
          <Box sx={{ px: { xs: 0, lg: '200px' } }}>
            <Typography sx={{ typography: 'h4', color: 'primary.main', marginBottom: '20px' }}>
              Test editor
            </Typography>
            <BasicInformation
              {...basicInfo}
              onChange={handleBasicInfoChange}
              errors={errors?.basicInfo}
            />

            {parts.map((part, index) => (
              <Paper key={part.id} sx={panelPaper}>
                {!part.type ? (
                  <SelectPartType
                    partTypes={PART_TYPES}
                    onSelectType={(typeId) => handleSelectPartType(part.id, typeId)}
                    onCancel={() => handleCancelPart(part.id)}
                  />
                ) : (
                  <>
                    {part.type === 'multichoice_images' && (
                      <MultiChoiceImagePart
                        index={index}
                        part={part}
                        onChange={(updatedPart) =>
                          setParts((prev) => prev.map((p) => (p.id === part.id ? updatedPart : p)))
                        }
                        onDelete={() => handleCancelPart(part.id)}
                      />
                    )}

                    {part.type === 'multichoice_texts' && (
                      <MultiChoiceTextPart
                        index={index}
                        part={part}
                        onChange={(updatedPart) =>
                          setParts((prev) => prev.map((p) => (p.id === part.id ? updatedPart : p)))
                        }
                        onDelete={() => handleCancelPart(part.id)}
                      />
                    )}

                    {part.type === 'fill_in_the_blanks' && (
                      <FillInTheBlankPart
                        index={index}
                        part={part}
                        onChange={(updatedPart) =>
                          setParts((prev) => prev.map((p) => (p.id === part.id ? updatedPart : p)))
                        }
                        onDelete={() => handleCancelPart(part.id)}
                      />
                    )}

                    {part.type === 'matching' && (
                      <MatchingPart
                        index={index}
                        part={part}
                        onChange={(updatedPart) =>
                          setParts((prev) => prev.map((p) => (p.id === part.id ? updatedPart : p)))
                        }
                        onDelete={() => handleCancelPart(part.id)}
                      />
                    )}
                  </>
                )}
              </Paper>
            ))}

            <Box sx={addPartBox} onClick={handleAddPart}>
              + Add new part
            </Box>
          </Box>
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1000 }}
        open={isSaving}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Box>
  );
}
