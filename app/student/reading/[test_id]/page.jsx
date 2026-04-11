'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  CircularProgress,
  Box,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  IconButton,
  Stack,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import MultiChoiceReading from '@/components/Reading/MultiChoice/MultiChoiceReading';
import FillBlanksReading from '@/components/Reading/FillBlanks/FillBlanksReading';
import MatchingReading from '@/components/Reading/Matching/MatchingReading';
import { getFullReceptiveTest } from '@/api/tests';
import { submitReceptiveTest } from '@/api/test';
import {
  transformMultiChoiceTest,
  transformFillBlanksTest,
  transformMatchingTest,
} from '@/utils/testDataTransform';
import ReceptiveTestHistory from '@/components/Student/Reading_Listening/ReceptiveTestHistory';

export default function ReadingTestPage() {
  const params = useParams();
  const testId = params?.test_id;
  const router = useRouter();

  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentPartIndex, setCurrentPartIndex] = useState(0);
  const [isPracticing, setIsPracticing] = useState(false);
  const [startTime] = useState(new Date().toISOString());
  const [openSubmitDialog, setOpenSubmitDialog] = useState(false);
  const [openWarningDialog, setOpenWarningDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    async function fetchTestData() {
      if (!testId) {
        setError('Test ID is required.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const backendTest = await getFullReceptiveTest(testId);

        if (!backendTest?.receptive_test?.receptive_parts) {
          setError('This test does not contain any parts.');
          setLoading(false);
          return;
        }

        const parts = backendTest.receptive_test.receptive_parts.map((part) => {
          const format = part.format;
          let componentType = 'unknown';
          let transformedData = null;

          if (
            format === 'F' ||
            format === 'G' ||
            format === 'A' ||
            format === 'B' ||
            format === 'C'
          ) {
            componentType = 'multi-choice';
            const transformed = transformMultiChoiceTest({
              receptive_test: {
                receptive_parts: [part],
              },
            });
            transformedData = transformed.parts[0];
          } else if (format === 'H' || format === 'I' || format === 'D') {
            componentType = 'fill-blanks';
            const transformed = transformFillBlanksTest({
              receptive_test: {
                receptive_parts: [part],
              },
            });
            transformedData = transformed.parts[0];
          } else if (format === 'J' || format === 'E') {
            componentType = 'matching';
            const transformed = transformMatchingTest({
              receptive_test: {
                receptive_parts: [part],
              },
            });
            transformedData = transformed.parts[0];
          }

          return {
            order: part.order,
            format,
            componentType,
            data: transformedData,
            rawPart: part,
          };
        });

        parts.sort((a, b) => a.order - b.order);

        setTestData({
          id: backendTest.id,
          title: backendTest.title,
          description: backendTest.description,
          level: backendTest.level,
          skill: backendTest.skill,
          time: backendTest.time,
          parts,
        });
      } catch (err) {
        setError(err.message || 'Failed to load test data');
      } finally {
        setLoading(false);
      }
    }

    fetchTestData();
  }, [testId]);

  const handleAnswerChange = (newAnswers) => {
    setAnswers(newAnswers);
  };

  const handleSubmit = () => {
    const hasAnswer = Object.values(answers).some(
      (val) => val !== '' && val !== null && val !== undefined,
    );

    if (!hasAnswer) {
      setOpenWarningDialog(true);
      return;
    }

    setOpenSubmitDialog(true);
  };

  const handleConfirmSubmit = async () => {
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('accessToken');
      if (!token) {
        alert('Please login to submit your test.');
        setIsSubmitting(false);
        return;
      }

      const endTime = new Date().toISOString();
      const answer_histories = [];

      // Structure answer_histories based on parts and formats using the 'answers' state
      testData.parts.forEach((part) => {
        part.rawPart.receptive_questions.forEach((q) => {
          const userAnswer = answers[q.id] || answers[q.question_number];

          if (userAnswer) {
            const entry = { receptive_question: q.id };

            if (['F', 'G', 'A', 'B', 'C', 'H', 'E', 'J'].includes(part.format)) {
              // Multiple choice or Matching: find the answer ID corresponding to the selected label/option
              const selectedAnswer = q.receptive_answers.find((a) => a.option_label === userAnswer);
              if (selectedAnswer) {
                entry.receptive_answer = selectedAnswer.id;
              }
            } else if (part.format === 'I' || part.format === 'D') {
              // Open text fill in the blanks
              entry.user_answer_text = userAnswer;
            }

            answer_histories.push(entry);
          }
        });
      });

      const payload = {
        receptive_test: testData.id,
        type: 'S',
        start_time: startTime,
        end_time: endTime,
        total_time: Math.floor((new Date(endTime) - new Date(startTime)) / 1000),
        answer_histories,
      };

      const historyRes = await submitReceptiveTest(payload, token);
      setOpenSubmitDialog(false);
      router.push(`/student/reading/${testId}/results/${historyRes.id}`);
    } catch (err) {
      alert('Failed to submit test: ' + (err.message || 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePartChange = (newPartIndex) => {
    setCurrentPartIndex(newPartIndex);
  };

  const handleBack = () => {
    if (currentPartIndex > 0) {
      setCurrentPartIndex(currentPartIndex - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNext = () => {
    if (testData && currentPartIndex < testData.parts.length - 1) {
      setCurrentPartIndex(currentPartIndex + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <CircularProgress size={60} />
        <Box sx={{ fontSize: '18px', color: 'text.secondary' }}>Loading test data...</Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
          padding: 3,
        }}
      >
        <Alert
          severity="error"
          sx={{ maxWidth: 600 }}
          action={
            <Button color="inherit" size="small" onClick={() => window.location.reload()}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  if (!testData || !testData.parts || testData.parts.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
          padding: 3,
        }}
      >
        <Alert severity="info" sx={{ maxWidth: 600 }}>
          No test data available.
        </Alert>
      </Box>
    );
  }

  const currentPart = testData.parts[currentPartIndex];

  const renderPartComponent = () => {
    if (!currentPart || !currentPart.data) {
      return (
        <Alert severity="warning" sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
          This part format is not yet supported.
        </Alert>
      );
    }

    const commonProps = {
      testName: testData.title,
      parts: testData.parts.map((p, idx) => `Part ${idx + 1}`),
      currentPart: currentPartIndex + 1,
      answers,
      onAnswerChange: handleAnswerChange,
      onPartChange: handlePartChange,
      isTeacher: false,
      onSubmit: handleSubmit,
      onBack: handleBack,
      onNext: handleNext,
      currentSection: currentPartIndex + 1,
      totalSections: testData.parts.length,
    };

    switch (currentPart.componentType) {
      case 'multi-choice':
        return (
          <MultiChoiceReading
            {...commonProps}
            passage={currentPart.data.passage}
            passageTitle={currentPart.data.passageTitle}
            questions={currentPart.data.questions}
          />
        );

      case 'fill-blanks':
        return (
          <FillBlanksReading
            {...commonProps}
            passage={currentPart.data.passage}
            passageTitle={currentPart.data.passageTitle}
            blanks={currentPart.data.blanks}
            questions={currentPart.data.questions}
          />
        );

      case 'matching':
        return (
          <MatchingReading
            {...commonProps}
            passage={currentPart.data.passage}
            passageTitle={currentPart.data.passageTitle}
            sentences={currentPart.data.sentences}
            gaps={currentPart.data.gaps}
          />
        );

      default:
        return (
          <Alert severity="warning" sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
            Unknown part format: {currentPart.format}
          </Alert>
        );
    }
  };

  if (!isPracticing) {
    return (
      // <ReceptiveTestHistory
      //   testData={testData}
      //   onPracticeNow={() => {
      //     setIsPracticing(true);
      //     window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      //   }}
      // />
      <ReceptiveTestHistory
        onPracticeNow={() => {
          setIsPracticing(true);
          window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
        }}
      />
    );
  }

  return (
    <>
      {renderPartComponent()}

      {/* Submit Confirmation Dialog */}
      <Dialog
        open={openSubmitDialog}
        onClose={() => !isSubmitting && setOpenSubmitDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: '20px',
            padding: '12px',
            maxWidth: '480px',
            width: '100%',
            position: 'relative',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          },
        }}
      >
        <IconButton
          onClick={() => setOpenSubmitDialog(false)}
          sx={{
            position: 'absolute',
            right: 16,
            top: 16,
            color: '#64748b',
            '&:hover': { backgroundColor: '#f1f5f9' },
          }}
          disabled={isSubmitting}
        >
          <CloseIcon fontSize="small" />
        </IconButton>

        <DialogContent sx={{ textAlign: 'center', pt: 6, pb: 2 }}>
          <Stack spacing={4} alignItems="center">
            <Box
              sx={{
                width: '90px',
                height: '90px',
                borderRadius: '50%',
                backgroundColor: '#f0fdf4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #dcfce7',
              }}
            >
              <InfoOutlinedIcon sx={{ fontSize: 48, color: '#16a34a' }} />
            </Box>

            <Typography
              sx={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#1e293b',
                lineHeight: 1.2,
                px: 3,
                fontFamily: '"Outfit", sans-serif',
              }}
            >
              Are you sure you want to submit?
            </Typography>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'center', gap: 3, pb: 6, pt: 2, px: 4 }}>
          <Button
            onClick={() => setOpenSubmitDialog(false)}
            variant="outlined"
            disabled={isSubmitting}
            sx={{
              borderRadius: '50px',
              px: 5,
              py: 1.5,
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.875rem',
              color: '#475569',
              borderColor: '#e2e8f0',
              borderWidth: '1.5px',
              fontFamily: '"Outfit", sans-serif',
              '&:hover': {
                backgroundColor: '#f8fafc',
                borderColor: '#cbd5e1',
                borderWidth: '1.5px',
              },
            }}
          >
            CANCEL
          </Button>

          <Button
            onClick={handleConfirmSubmit}
            variant="contained"
            disabled={isSubmitting}
            sx={{
              borderRadius: '50px',
              px: isSubmitting ? 6 : 4,
              py: 1.5,
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.875rem',
              backgroundColor: '#166534',
              color: '#ffffff',
              fontFamily: '"Outfit", sans-serif',
              boxShadow: '0 4px 14px 0 rgba(22, 101, 52, 0.39)',
              '&:hover': {
                backgroundColor: '#14532d',
                boxShadow: '0 6px 20px rgba(22, 101, 52, 0.23)',
              },
              '&.Mui-disabled': {
                backgroundColor: '#166534',
                opacity: 0.7,
              },
            }}
          >
            {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'SUBMIT'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Warning Dialog for empty submission */}
      <Dialog
        open={openWarningDialog}
        onClose={() => setOpenWarningDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          elevation: 0,
          sx: {
            borderRadius: '24px',
            padding: 2,
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          },
        }}
      >
        <Box sx={{ position: 'absolute', right: 16, top: 16 }}>
          <IconButton
            onClick={() => setOpenWarningDialog(false)}
            sx={{
              color: '#94a3b8',
              '&:hover': {
                backgroundColor: '#f1f5f9',
                color: '#475569',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <DialogContent sx={{ pt: 4, pb: 1, textAlign: 'center' }}>
          <Stack alignItems="center" spacing={3}>
            <Box
              sx={{
                width: '90px',
                height: '90px',
                borderRadius: '50%',
                backgroundColor: '#fffbeb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #fef3c7',
              }}
            >
              <WarningAmberIcon sx={{ fontSize: 48, color: '#f59e0b' }} />
            </Box>

            <Typography
              sx={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: '#1e293b',
                lineHeight: 1.2,
                px: 2,
                fontFamily: '"Outfit", sans-serif',
              }}
            >
              Warning
            </Typography>
            <Typography
              sx={{
                fontSize: '1rem',
                color: '#475569',
                px: 2,
                fontFamily: '"Outfit", sans-serif',
              }}
            >
              Please select or fill in at least one answer before submitting!
            </Typography>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'center', pb: 4, pt: 2, px: 4 }}>
          <Button
            onClick={() => setOpenWarningDialog(false)}
            variant="contained"
            sx={{
              borderRadius: '50px',
              px: 6,
              py: 1.5,
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '1rem',
              backgroundColor: '#f59e0b',
              color: '#ffffff',
              fontFamily: '"Outfit", sans-serif',
              boxShadow: '0 4px 14px 0 rgba(245, 158, 11, 0.39)',
              '&:hover': {
                backgroundColor: '#d97706',
                boxShadow: '0 6px 20px rgba(245, 158, 11, 0.23)',
              },
            }}
          >
            GOT IT
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
