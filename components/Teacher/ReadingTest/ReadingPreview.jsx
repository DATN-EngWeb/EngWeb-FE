'use client';

import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import FillBlanksContent from '../../Reading/FillBlanks/FillBlanksContent';
import MatchingContent from '../../Reading/Matching/MatchingContent';
import MultiChoiceContent from '../../Reading/MultiChoice/MultiChoiceContent';

const PrintView = ({ testData }) => (
  <Box
    sx={{
      display: 'none',
      '@media print': {
        display: 'block',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        bgcolor: 'white',
        zIndex: 9999,
      },
      p: 0,
    }}
  >
    <Typography variant="h4" align="center" sx={{ mb: 4, fontWeight: 700, color: '#000' }}>
      {testData.title || 'Reading Test'}
    </Typography>

    {testData.parts?.map((part, index) => (
      <Box
        key={index}
        sx={{
          mb: index === testData.parts.length - 1 ? 0 : 6,
          pageBreakAfter: 'always',
          '&:last-child': { pageBreakAfter: 'auto' },
          '& p': { margin: 0, padding: 0 }, // Remove <p> tag spacing
        }}
      >
        <Box
          sx={{
            mb: 4,
            lineHeight: 1.8,
            fontSize: '1.2rem',
            textAlign: 'justify',
            p: 0,
          }}
        >
          <div dangerouslySetInnerHTML={{ __html: part.content || '' }} />
        </Box>

        <Box sx={{ mt: 4 }}>
          {part.questions?.map((q, qIndex) => (
            <Box key={qIndex} sx={{ mb: 3, pageBreakInside: 'avoid' }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Typography sx={{ fontWeight: 600 }}>{q.question_number}.</Typography>
                <div
                  style={{ fontWeight: 600 }}
                  dangerouslySetInnerHTML={{ __html: q.content || `Question ${q.question_number}` }}
                />
              </Box>
              <Box sx={{ ml: 4, mt: 1 }}>
                {q.answers?.map((ans, aIndex) => (
                  <Box key={aIndex} sx={{ display: 'flex', gap: 1, mb: 0.5 }}>
                    <Typography variant="body2">{ans.option_label}.</Typography>
                    <Typography variant="body2">{ans.answer_text}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    ))}
  </Box>
);

const ReadingPreview = ({ open, onClose, testData, inline = false }) => {
  const [currentPartIndex, setCurrentPartIndex] = useState(0);

  const parts = testData?.parts || [];
  const partTitles = parts.map((p, index) => `Part ${index + 1}`);

  const currentPart = parts[currentPartIndex];

  const handlePartChange = (newIndex) => {
    if (newIndex >= 0 && newIndex < parts.length) {
      setCurrentPartIndex(newIndex);
    }
  };

  const [statusAlert, setStatusAlert] = useState(false);

  const handleAIReview = () => {
    // Cho phép AI Review nếu bài đã Public (P) hoặc Send for review (S)
    // status: "P" (Public), "D" (Draft), "S" (Submitted/Send for review)
    const status = testData?.test?.status || testData?.status;
    if (status === 'D') {
      setStatusAlert(true);
    } else {
      window.print();
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
      onAIReview: handleAIReview,
      onExit: onClose,
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
  }, [currentPart, currentPartIndex, parts, partTitles, testData.title]);

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

      {/* Status Warning Dialog */}
      <Dialog
        open={statusAlert}
        onClose={() => setStatusAlert(false)}
        PaperProps={{
          sx: { borderRadius: '12px', p: 1, maxWidth: '400px' },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            color: 'warning.main',
            fontWeight: 700,
          }}
        >
          <WarningAmberIcon /> AI Review Unavailable
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            This test has <strong>not been submitted for review</strong>. Please submit the test for
            review before using the AI Review feature.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setStatusAlert(false)}
            sx={{ textTransform: 'none', color: 'text.secondary' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={onClose}
            sx={{ borderRadius: '20px', textTransform: 'none', px: 3 }}
          >
            Back to Upload Page
          </Button>
        </DialogActions>
      </Dialog>

      {/* Invisible component for printing */}
      <PrintView
        testData={{
          title: testData?.test?.title || testData?.title || 'Reading Test',
          parts: testData?.parts || testData?.test?.parts || [],
        }}
      />
    </Box>
  );
};

export default ReadingPreview;
