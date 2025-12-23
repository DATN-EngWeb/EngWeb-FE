'use client';

import { Paper, Typography, Box } from '@mui/material';
import BasicInformation from './BasicInformation';
import MultiChoiceImagePart from './MultiChoiceImagePart';
import MultiChoiceTextPart from './MultiChoiceTextPart';
import FillInTheBlankPart from './FillInTheBlankPart';
import MatchingPart from './MatchingPart';
import SelectPartType from './SelectPartType';
import TestEditorHeader from '../UploadTest/TestEditorHeader';
import TestEditorActions from '../UploadTest/TestEditorActions';
import { useState } from 'react';
import { buildTestPayload } from '../../utils/testPayload';
import { buildFormData } from '../../utils/buildFormData';
import { Image, TextFields, Edit, Link } from '@mui/icons-material';

export const PART_TYPES = [
  {
    id: 'multichoice_images',
    icon: <Image sx={{ fontSize: 40 }} />,
    title: 'Multiple choice images',
    description: 'Students select the correct image',
  },
  {
    id: 'multichoice_texts',
    icon: <TextFields sx={{ fontSize: 40 }} />,
    title: 'Multiple choice text',
    description: 'Students select the correct text answer',
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
  });

  const [parts, setParts] = useState([]);

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
    setParts((prev) => prev.map((p) => (p.id === partId ? { ...p, type } : p)));
  };

  const handleSubmit = async (status) => {
    console.log('Submitting test with status:', status);

    try {
      const payload = buildTestPayload({ basicInfo, parts, status });
      const formData = buildFormData(payload, parts);

      for (const [key, value] of formData.entries()) {
        console.log(
          key,
          value instanceof File ? `File(name=${value.name}, size=${value.size})` : value,
        );
      }
      // TODO: Call API and verify data
      // await createListeningTest(payload);

      alert(`Test ${status} successfully!`);
    } catch (error) {
      console.error('Submit error:', error);
      alert(`Submit failed: ${error.message}`);
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: 'background.default',
        minHeight: '100vh',
        p: 2,
        paddingLeft: 20,
        paddingRight: 20,
      }}
    >
      <TestEditorHeader
        title="Create New Listening Test"
        description="Fill in the details below to create a new listening test for your students"
      />
      <TestEditorActions
        onPreview={() => console.log('Preview')}
        onSendReview={() => handleSubmit('review')}
        onSaveDraft={() => handleSubmit('draft')}
        onPublish={() => handleSubmit('published')}
      />
      <div style={{ paddingLeft: '220px', paddingRight: '220px' }}>
        <Typography
          sx={{
            typography: 'h4',
            color: 'primary.main',
            marginBottom: '20px',
          }}
        >
          Test editor
        </Typography>

        <BasicInformation
          testName={basicInfo.testName}
          level={basicInfo.level}
          onTestNameChange={(v) => handleBasicInfoChange('testName', v)}
          onLevelChange={(v) => handleBasicInfoChange('level', v)}
        />
        {parts.map((part, index) => (
          <Paper
            key={part.id}
            sx={{
              p: 3,
              mb: 3,
              border: '2px solid',
              borderColor: 'yellow.main',
              borderRadius: 2,
            }}
          >
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
        <Box
          sx={{
            border: '2px dashed',
            borderColor: 'divider',
            borderRadius: 2,
            p: 4,
            textAlign: 'center',
            color: 'text.secondary',
            cursor: 'pointer',
            '&:hover': { bgcolor: 'action.hover' },
          }}
          onClick={handleAddPart}
        >
          + Add new part
        </Box>
      </div>
    </Box>
  );
}
