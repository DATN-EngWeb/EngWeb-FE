'use client';

import React, { useState, useMemo } from 'react';
import { Box, Typography, Dialog, Button, Container } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import FillBlanksContent from '../../Reading/FillBlanks/FillBlanksContent';
import MatchingContent from '../../Reading/Matching/MatchingContent';
import MultiChoiceContent from '../../Reading/MultiChoice/MultiChoiceContent';
import { listeningtestStyles } from '@/styles/Student/Listening/listeningTestStyles';
import { transformMultiChoiceTest } from '@/utils/testDataTransform';

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
  const [currentPartIndex, setCurrentPartIndex] = useState(0);

  const parts = testData?.parts || [];
  const currentPart = parts[currentPartIndex];

  const handlePartChange = (newIndex) => {
    if (newIndex >= 0 && newIndex < parts.length) {
      setCurrentPartIndex(newIndex);
    }
  };

  const transformedData = useMemo(() => {
    if (!currentPart) return null;

    const activeQuestions = (currentPart.questions || []).filter((q) => q.action !== 'delete');
    const filterAnswers = (answers) => (answers || []).filter((a) => a.action !== 'delete');

    const commonProps = {
      passage: currentPart.content || '',
      passageTitle: currentPart.description || '',
      answers: {},
      onAnswerChange: () => {},
      showResults: true,
    };

    switch (currentPart.format) {
      case 'F': {
        const transformed = transformMultiChoiceTest({
          receptive_test: {
            receptive_parts: [
              {
                id: currentPart.id,
                format: 'F',
                content: currentPart.content || '',
                description: currentPart.description || '',
                order: currentPart.order || 1,
                receptive_questions: activeQuestions.map((q) => ({
                  id: q.id,
                  question_number: q.question_number,
                  content: q.content,
                  explanation: q.explanation,
                  receptive_answers: filterAnswers(q.answers).map((a) => ({
                    id: a.id,
                    option_label: a.option_label,
                    answer_text: a.answer_text,
                    is_correct: a.is_correct,
                  })),
                })),
              },
            ],
          },
        });
        const d = transformed.parts[0];
        if (!d) return null;
        return {
          component: MultiChoiceContent,
          props: {
            ...commonProps,
            passage: d.passage,
            passageTitle: d.passageTitle,
            stimulusPageUrls: d.stimulusPageUrls,
            hidePassage: !String(d.passage || '').trim(),
            questions: d.questions.map((q) => ({
              id: q.id,
              question_number: q.questionNumber,
              question: q.question || `Question ${q.questionNumber}`,
              explanation: q.explanation,
              options: (q.options || []).map((a, idx) => ({
                value: String(a.id || a.option_label || a.value),
                option_label: a.option_label || String.fromCharCode(65 + idx),
                label: a.label || a.answer_text || '',
                answer_text: a.answer_text || a.label,
                text: a.answer_text || a.label,
                isCorrect: a.isCorrect,
              })),
            })),
          },
        };
      }

      case 'G':
        return {
          component: MultiChoiceContent,
          props: {
            ...commonProps,
            questions: activeQuestions.map((q) => ({
              id: q.id,
              question_number: q.question_number,
              question: q.content || `Question ${q.question_number}`,
              explanation: q.explanation,
              options: filterAnswers(q.answers).map((a, idx) => ({
                value: String(a.id || a.option_label),
                option_label: a.option_label || String.fromCharCode(65 + idx),
                label: a.answer_text || '',
                isCorrect: a.is_correct || false,
              })),
            })),
          },
        };

      case 'I':
      case 'H':
        return {
          component: FillBlanksContent,
          props: {
            ...commonProps,
            blanks: activeQuestions.map((q) => q.question_number).sort((a, b) => a - b),
            questions: activeQuestions.map((q) => {
              const activeAnswers = filterAnswers(q.answers);
              return {
                id: q.id,
                question_number: q.question_number,
                question: q.content || '',
                explanation: q.explanation,
                correctText: activeAnswers?.[0]?.answer_text || '',
                options:
                  currentPart.format === 'H'
                    ? activeAnswers.map((a, idx) => ({
                        value: String(a.id || a.option_label),
                        option_label: a.option_label || String.fromCharCode(65 + idx),
                        label: a.answer_text || '',
                        isCorrect: a.is_correct || false,
                      }))
                    : [],
              };
            }),
          },
        };

      case 'J':
        return {
          component: MatchingContent,
          props: {
            ...commonProps,
            sentences: activeQuestions.map((q) => ({
              id: q.id,
              text: q.content || q.text || '',
            })),
            gaps: activeQuestions.map((q) => q.question_number).sort((a, b) => a - b),
            questions: activeQuestions.map((q) => {
              const activeAnswers = filterAnswers(q.answers);
              return {
                id: q.id,
                question_number: q.question_number,
                explanation: q.explanation,
                correctLabel: activeAnswers?.[0]?.option_label || '',
              };
            }),
          },
        };

      default:
        return null;
    }
  }, [currentPart]);

  const mainLayout = (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        borderRadius: 4,
        border: '1px solid',
        borderColor: 'dark.main',
        boxShadow: '0 6px 16px rgba(61, 30, 25, 0.06)',
        overflow: 'hidden',
      }}
    >
      {/* KHỐI 1: TEST HEADING */}
      <Box
        maxWidth="lg"
        sx={{ ...listeningtestStyles.testHeadingContainer, mx: 'auto', width: '100%' }}
      >
        <Box sx={{ ...listeningtestStyles.timeLeft, visibility: 'hidden' }}>
          <AccessTimeIcon sx={{ fontSize: 28, mr: 0.5 }} />
          00:00
        </Box>
        <Box sx={listeningtestStyles.nameTestAndFormatPart}>
          <Typography sx={listeningtestStyles.nameTest}>{testData?.title || 'Preview'}</Typography>
          <Typography sx={listeningtestStyles.formatName}>
            Part {currentPartIndex + 1}: {getReadingPartTypeLabel(currentPart?.format)}
          </Typography>
        </Box>
        <Box sx={{ ...listeningtestStyles.summitButtonWrapper, visibility: 'hidden' }}>
          <Button disabled>Submit</Button>
        </Box>
      </Box>

      {/* KHỐI 2: LIST PART SELECTION */}
      <Box
        maxWidth="lg"
        sx={{ ...listeningtestStyles.listPartContainer, mx: 'auto', width: '100%' }}
      >
        {parts.map((_, index) => (
          <Box
            key={index}
            onClick={() => handlePartChange(index)}
            sx={{
              ...listeningtestStyles.boxPart,
              ...(index === currentPartIndex && {
                backgroundColor: 'background.default',
                borderColor: 'orange.light',
                color: 'orange.dark',
              }),
            }}
          >
            Part {index + 1}
          </Box>
        ))}
      </Box>
      <Box sx={{ ...listeningtestStyles.separatorLine, backgroundColor: 'gray.main' }} />

      {/* KHỐI 3: CONTENT VIEW */}
      <Box
        sx={{
          width: '100%',
          flex: 1,
          display: 'flex',
          bgcolor: 'background.default',
          minHeight: '60vh',
        }}
      >
        {transformedData?.component ? (
          <transformedData.component {...transformedData.props} />
        ) : (
          <Box sx={{ p: 4, textAlign: 'center', width: '100%' }}>
            <Typography color="text.secondary">No content available for preview.</Typography>
          </Box>
        )}
      </Box>

      {/* KHỐI 4: STEPPER NAVIGATION */}
      <Box sx={{ width: '100%', backgroundColor: 'background.gray' }}>
        <Container maxWidth="lg" sx={listeningtestStyles.stepperContainer}>
          <Typography
            sx={{
              ...listeningtestStyles.backButton,
              visibility: currentPartIndex === 0 ? 'hidden' : 'visible',
            }}
            onClick={() => {
              handlePartChange(currentPartIndex - 1);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <ExpandLessIcon
              sx={{ fontSize: '1.8rem', color: 'gray.main', transform: 'rotate(270deg)' }}
            />
            Prev
          </Typography>
          <Typography sx={{ fontSize: '1rem' }}>
            Section {currentPartIndex + 1} of {parts.length}
          </Typography>
          <Box sx={listeningtestStyles.summitButtonWrapper}>
            {currentPartIndex !== parts.length - 1 && (
              <Button
                sx={listeningtestStyles.nextButton}
                onClick={() => {
                  handlePartChange(currentPartIndex + 1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                Next
              </Button>
            )}
          </Box>
        </Container>
      </Box>
    </Box>
  );

  if (inline) return mainLayout;

  return (
    <Dialog fullScreen open={open} onClose={onClose}>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', position: 'relative' }}>
        {showBackButton && (
          <Button
            onClick={onClose}
            sx={{ position: 'absolute', right: 20, top: 20, zIndex: 1000 }}
            variant="outlined"
          >
            Close Preview
          </Button>
        )}
        {mainLayout}
      </Box>
    </Dialog>
  );
};

export default ReadingPreview;
