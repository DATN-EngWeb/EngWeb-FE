'use client';

import React, { useRef, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import FillBlanksContent from '../../Reading/FillBlanks/FillBlanksContent';
import MatchingContent from '../../Reading/Matching/MatchingContent';
import MultiChoiceContent from '../../Reading/MultiChoice/MultiChoiceContent';

const getReadingPartTypeLabel = (format) => {
  switch (format) {
    case 'F':
      return 'Multiple Choice (Short Text)';
    case 'G':
      return 'Multiple Choice (Long Text)';
    case 'H':
      return 'Fill In The Blanks (Multiple Choice)';
    case 'I':
      return 'Fill In The Blanks (Text)';
    case 'J':
      return 'Matching';
    default:
      return 'Unknown Test Type';
  }
};

const ReadingPreview = ({ open, onClose, testData, inline = false, showBackButton = true }) => {
  const router = useRouter();
  const [currentPartIndex, setCurrentPartIndex] = useState(0);

  const parts = testData?.parts || [];
  const partTitles = parts.map((_part, index) => `Part ${index + 1}`);

  const currentPart = parts[currentPartIndex];

  const handlePartChange = (newIndex) => {
    if (newIndex >= 0 && newIndex < parts.length) {
      setCurrentPartIndex(newIndex);
    }
  };

  const transformedData = useMemo(() => {
    if (!currentPart) return null;

    const commonProps = {
      testName: testData?.test?.title || testData?.title || '',
      partLabel: `Part ${currentPartIndex + 1}: ${getReadingPartTypeLabel(currentPart.format)}`,
      parts: partTitles,
      currentPart: currentPartIndex + 1,
      passage: currentPart.content || '',
      passageTitle: currentPart.description || '',
      onPartChange: handlePartChange,
      isTeacher: true,
      onSubmit: null,
      onBack: () => handlePartChange(currentPartIndex - 1),
      onNext: () => handlePartChange(currentPartIndex + 1),
      currentSection: currentPartIndex + 1,
      totalSections: parts.length,
      onExit: showBackButton ? onClose : undefined,
      embedded: inline,
    };

    switch (currentPart.format) {
      case 'F': // Multiple Choice Short
      case 'G': // Multiple Choice Long
        return {
          component: MultiChoiceContent,
          props: {
            ...commonProps,
            questions: currentPart.questions.map((q) => ({
              id: q.id,
              question: q.content || `Question ${q.question_number}`,
              options: q.answers.map((a, index) => ({
                value: String(a.id || a.option_label),
                label: `${a.option_label && a.option_label !== 'undefined' && a.option_label !== 'null' ? a.option_label : String.fromCharCode(65 + index)}. ${a.answer_text || ''}`,
              })),
            })),
          },
        };

      case 'I': // Fill Blanks Text
      case 'H': // Fill Blanks Choice
        return {
          component: FillBlanksContent,
          props: {
            ...commonProps,
            blanks: currentPart.questions.map((q) => q.question_number).sort((a, b) => a - b),
            questions: currentPart.questions.map((q) => ({
              id: q.id,
              question_number: q.question_number,
              question: q.content || `Question ${q.question_number}`,
              options:
                currentPart.format === 'H'
                  ? q.answers.map((a, index) => ({
                      value: String(a.id || a.option_label),
                      label: `${a.option_label && a.option_label !== 'undefined' && a.option_label !== 'null' ? a.option_label : String.fromCharCode(65 + index)}. ${a.answer_text || ''}`,
                    }))
                  : [],
            })),
          },
        };

      case 'J': {
        const activeQuestions = currentPart.questions.filter((q) => q.action !== 'delete');
        const sentences = activeQuestions.map((q) => ({
          id: q.id,
          text: q.content || q.text || q.explanation || '', // Support both content and text, fallback to explanation
        }));

        const gaps = activeQuestions.map((q) => q.question_number).sort((a, b) => a - b);

        return {
          component: MatchingContent,
          props: {
            ...commonProps,
            sentences: sentences,
            gaps: gaps,
            passage: currentPart.content || '',
          },
        };
      }

      default:
        return null;
    }
  }, [currentPart, currentPartIndex, onClose, parts, partTitles, showBackButton, testData]);

  if (!open && !inline) return null;

  const ContentComponent = transformedData?.component;

  if (inline) {
    return (
      <Box>
        {ContentComponent ? (
          <ContentComponent {...transformedData.props} />
        ) : (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">
              {parts.length === 0
                ? 'No parts added yet.'
                : 'This part type is not supported for preview yet or is invalid.'}
            </Typography>
          </Box>
        )}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: 'relative',
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          flex: 1,
          overflow: 'hidden',
          '@media print': {
            display: 'none', // Hide on-screen preview when printing
          },
        }}
      >
        {ContentComponent ? (
          <ContentComponent {...transformedData.props} />
        ) : (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">
              {parts.length === 0
                ? 'No parts added yet.'
                : 'This part type is not supported for preview yet or is invalid.'}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ReadingPreview;
