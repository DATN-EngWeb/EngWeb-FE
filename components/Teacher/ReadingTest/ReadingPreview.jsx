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
      testName: testData?.test?.title || testData?.title || 'Preview Test',
      parts: partTitles,
      currentPart: currentPartIndex + 1,
      passage: currentPart.content || '',
      passageTitle: currentPart.description || '',
      onPartChange: handlePartChange,
      isTeacher: true,
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
              options: q.answers.map((a) => ({
                value: String(a.id || a.option_label),
                label: `${a.option_label}. ${a.answer_text}`,
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
              options: q.answers.map((a) => ({
                value: String(a.id || a.option_label),
                label: `${a.option_label}. ${a.answer_text}`,
              })),
            })),
          },
        };

      case 'J': {
        const sentences = [];
        const seenOptions = new Set();

        currentPart.questions.forEach((q) => {
          q.answers.forEach((a) => {
            if (!seenOptions.has(a.option_label)) {
              seenOptions.add(a.option_label);
              sentences.push({
                id: a.option_label,
                text: a.answer_text,
              });
            }
          });
        });

        let passageWithGaps = currentPart.content || '';
        const gaps = currentPart.questions.map((q) => q.question_number).sort((a, b) => a - b);

        return {
          component: MatchingContent,
          props: {
            ...commonProps,
            sentences: sentences.sort((a, b) => a.id.localeCompare(b.id)),
            gaps: gaps,
            passage: passageWithGaps,
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
