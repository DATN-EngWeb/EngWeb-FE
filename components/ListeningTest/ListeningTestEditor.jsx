'use client';

import { Box, Paper, Typography, Snackbar, Alert, Backdrop, CircularProgress } from '@mui/material';
import { Image, TextFields, Edit, Link } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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
import ScrollToTopButton from '../CreateTest/ScrollToTopButton';
import ListeningPreview from '../Teacher/ListeningPreview';

import { validateTest, getValidationErrorMessage } from '../../utils/testValidation';
import {
  collectFiles,
  transformPartsForSubmitWithUrls,
  transformApiResponseToParts,
  generatePayloadWithActions,
} from '../../utils/testTransformers';
import {
  createTest,
  getPresignedUrl,
  uploadToObjectStorage,
  confirmUpload,
  submitTestParts,
  updateTestParts,
  getRecepiveTestDetails,
  fetchHtmlContent,
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

export default function ListeningTestEditor({ testId: propTestId }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryTestId = searchParams.get('testId');
  const testId = propTestId || queryTestId;
  const isEditMode = !!testId;

  const [basicInfo, setBasicInfo] = useState({
    testName: '',
    level: '',
    time: '',
    description: '',
  });
  const [originalBasicInfo, setOriginalBasicInfo] = useState({
    testName: '',
    level: '',
    time: '',
    description: '',
  });
  const [parts, setParts] = useState([]);
  const [originalParts, setOriginalParts] = useState([]);
  const [errors, setErrors] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' });
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isPreviewActive, setIsPreviewActive] = useState(false);
  const [editingTestId, setEditingTestId] = useState(testId || null);

  useEffect(() => {
    if (!isEditMode) {
      return;
    }

    const loadTestData = async () => {
      try {
        const data = await getRecepiveTestDetails(testId);
        setEditingTestId(data.id);

        const loadedBasicInfo = {
          testName: data.title || '',
          level: data.level || '',
          time: data.time?.toString() || '',
          description: data.description || '',
        };
        setBasicInfo(loadedBasicInfo);
        setOriginalBasicInfo(JSON.parse(JSON.stringify(loadedBasicInfo)));

        let transformedParts = transformApiResponseToParts(data);

        transformedParts = await Promise.all(
          transformedParts.map(async (part) => {
            if (part._contentUrl) {
              const htmlContent = await fetchHtmlContent(part._contentUrl);
              return {
                ...part,
                content: htmlContent,
                _contentUrl: undefined,
              };
            }
            return { ...part, _contentUrl: undefined };
          }),
        );

        transformedParts.sort((a, b) => (a.order || 0) - (b.order || 0));

        setParts(transformedParts);
        setOriginalParts(JSON.parse(JSON.stringify(transformedParts)));

        setSnackbar({
          open: true,
          message: 'Test loaded successfully',
          severity: 'success',
        });
      } catch (error) {
        setSnackbar({
          open: true,
          message: `Failed to load test: ${error.message}`,
          severity: 'error',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadTestData();
  }, [testId]);

  const handleBasicInfoChange = (field, value) => {
    setBasicInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddPart = () => {
    setParts((prev) => {
      const maxOrder = prev.length > 0 ? Math.max(...prev.map((p) => p.order || 0)) : 0;
      const newOrder = maxOrder + 1;

      return [
        ...prev,
        {
          id: crypto.randomUUID(),
          type: null,
          order: newOrder,
          questions: [],
          answers: [],
        },
      ];
    });
  };

  const handleCancelPart = (partId) => {
    setParts((prev) => prev.filter((p) => p.id !== partId));
  };

  const handleSelectPartType = (partId, type) => {
    setParts((prev) => {
      const partIndex = prev.findIndex((p) => p.id === partId);
      return prev.map((p, idx) => {
        if (p.id !== partId) return p;

        const newPart = { ...p, type, order: partIndex + 1 };
        if (type === 'multichoice_texts') {
          newPart.audioFormat = p.audioFormat || 'onetoone';
        }
        return newPart;
      });
    });
  };

  const handlePreview = () => {
    const validationErrors = validateTest(basicInfo, parts);
    if (validationErrors) {
      setErrors(validationErrors);
      const errorMessage = getValidationErrorMessage(validationErrors);
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
      return;
    }
    setIsPreviewActive((prev) => !prev);
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
      let finalTestId = editingTestId;

      if (!editingTestId) {
        const basicInfoData = {
          title: basicInfo.testName,
          type: 'R',
          level: basicInfo.level,
          skill: 'L',
          time: parseInt(basicInfo.time),
          description: basicInfo.description,
          status: status === 'Draft' ? 'D' : status === 'In review' ? 'I' : 'P',
        };

        const response = await createTest(basicInfoData);
        finalTestId = response.id;
        setEditingTestId(response.id);
      }

      const files = collectFiles(parts, originalParts);
      const filenameToUrl = {};
      for (const f of files) {
        const presign = await getPresignedUrl({
          filename: f.filename,
          fileSize: f.fileSize ?? f.file?.size,
          mimeType: f.mimeType ?? f.file?.type,
          category: 'tests',
          testId: finalTestId,
          part: f.partOrder,
        });

        const uploadResult = await uploadToObjectStorage({
          url: presign.url,
          mimeType: f.mimeType ?? f.file?.type,
          file: f.file,
        });
        const confirm = await confirmUpload({
          key: presign.key,
          fileSize: f.fileSize ?? f.file?.size,
          mimeType: f.mimeType ?? f.file?.type,
          etag: uploadResult.etag,
        });

        filenameToUrl[f.filename] = confirm.file_url || presign.url;
      }

      const partsWithOrder = parts.map((p, idx) => ({
        ...p,
        order: p.order || idx + 1,
      }));

      if (isEditMode && originalParts.length > 0) {
        const partsWithActions = generatePayloadWithActions(
          originalParts,
          partsWithOrder,
          filenameToUrl,
        );

        const basicInfoData = {
          title: basicInfo.testName,
          level: basicInfo.level,
          time: parseInt(basicInfo.time),
          description: basicInfo.description,
          status: status === 'Draft' ? 'D' : status === 'In review' ? 'I' : 'P',
        };

        await updateTestParts({
          testId: finalTestId,
          basicInfo: basicInfoData,
          receptiveTestData: { receptive_parts: partsWithActions },
        });
      } else {
        const preparedParts = transformPartsForSubmitWithUrls(partsWithOrder, filenameToUrl);
        await submitTestParts({ testId: finalTestId, parts: preparedParts });
      }

      setSnackbar({ open: true, message: `Test ${status} successfully!`, severity: 'success' });

      setBasicInfo({ testName: '', level: '', time: '', description: '' });
      setOriginalBasicInfo({ testName: '', level: '', time: '', description: '' });
      setParts([]);
      setOriginalParts([]);
      setErrors(null);
      setIsSaving(false);

      setTimeout(() => {
        router.push('/teacher');
      }, 1000);
    } catch (error) {
      setSnackbar({ open: true, message: `Submit failed: ${error.message}`, severity: 'error' });
      setIsSaving(false);
    }
  };

  return isPreviewActive ? (
    <ListeningPreview
      basicInfo={basicInfo}
      parts={parts}
      onPreview={() => setIsPreviewActive((prev) => !prev)}
    />
  ) : (
    <Box sx={container}>
      <TestEditorHeader
        title={isEditMode ? 'Update Listening Test' : 'Create New Listening Test'}
        description={
          isEditMode
            ? 'Update the test details below'
            : 'Fill in the details below to create a new listening test for your students'
        }
        sx={{ mb: 2.5 }}
      />
      <TestEditorActions
        onPreview={() => handlePreview()}
        onSendReview={() => handleSubmit('In review')}
        onSaveDraft={() => handleSubmit('Draft')}
        onPublish={() => handleSubmit('Published')}
        sx={{ mb: 3 }}
      />

      {isLoading ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '50vh',
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ filter: isSaving ? 'blur' : 'none' }}>
          <Box sx={contentWrap}>
            <Box sx={{ px: { xs: 0, lg: '180px' } }}>
              <Typography
                sx={{
                  color: 'primary.main',
                  fontWeight: 600,
                  lineHeight: 1.1,
                  letterSpacing: '-0.5px',
                  fontSize: { xs: '1rem', sm: '1.8rem' },
                  marginBottom: '20px',
                }}
              >
                Test Editor
              </Typography>
              <BasicInformation
                {...basicInfo}
                onChange={handleBasicInfoChange}
                errors={errors?.basicInfo}
              />

              {parts
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map((part, index) => (
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
                              setParts((prev) =>
                                prev.map((p) => (p.id === part.id ? updatedPart : p)),
                              )
                            }
                            onDelete={() => handleCancelPart(part.id)}
                          />
                        )}

                        {part.type === 'multichoice_texts' && (
                          <MultiChoiceTextPart
                            index={index}
                            part={part}
                            onChange={(updatedPart) =>
                              setParts((prev) =>
                                prev.map((p) => (p.id === part.id ? updatedPart : p)),
                              )
                            }
                            onDelete={() => handleCancelPart(part.id)}
                          />
                        )}

                        {part.type === 'fill_in_the_blanks' && (
                          <FillInTheBlankPart
                            index={index}
                            part={part}
                            onChange={(updatedPart) =>
                              setParts((prev) =>
                                prev.map((p) => (p.id === part.id ? updatedPart : p)),
                              )
                            }
                            onDelete={() => handleCancelPart(part.id)}
                          />
                        )}

                        {part.type === 'matching' && (
                          <MatchingPart
                            index={index}
                            part={part}
                            onChange={(updatedPart) =>
                              setParts((prev) =>
                                prev.map((p) => (p.id === part.id ? updatedPart : p)),
                              )
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
      )}

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

      <ScrollToTopButton />
    </Box>
  );
}
