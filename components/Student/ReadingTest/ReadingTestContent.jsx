'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  CircularProgress,
  Box,
  Alert,
  Button,
  Dialog,
  DialogContent,
  DialogActions,
  Typography,
  IconButton,
  Stack,
  Snackbar,
  Container,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import SendIcon from '@mui/icons-material/Send';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

import MultiChoiceReading from '@/components/Reading/MultiChoice/MultiChoiceReading';
import FillBlanksReading from '@/components/Reading/FillBlanks/FillBlanksReading';
import MatchingReading from '@/components/Reading/Matching/MatchingReading';
import { getFullReceptiveTest } from '@/api/tests';
import { createReceptiveTest } from '@/api/test';
import {
  transformMultiChoiceTest,
  transformFillBlanksTest,
  transformMatchingTest,
} from '@/utils/testDataTransform';
import ReceptiveTestResult from '@/components/Student/ReceptiveTestResult/ReceptiveTestResult';
import { listeningtestStyles } from '@/styles/Student/Listening/listeningTestStyles';
import Skeleton from '../ListeningTest/skeleton';

// Hàm helper format thời gian hiển thị
const formatTimeFromSeconds = (totalSeconds) => {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export default function ReadingTestContent({ testId }) {
  const router = useRouter();

  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentPartIndex, setCurrentPartIndex] = useState(0);
  const [startTime, setStartTime] = useState(new Date().toISOString());
  const [openSubmitDialog, setOpenSubmitDialog] = useState(false);
  const [openWarningDialog, setOpenWarningDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitType, setSubmitType] = useState('S');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [historyId, setHistoryId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  // Timer Logic
  useEffect(() => {
    if (isSubmitting || isReadOnly) return;

    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isSubmitting, isReadOnly]);

  // Fetch Test Data
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

        if (typeof window !== 'undefined') {
          const saved = window.sessionStorage.getItem('current_receptive_attempt');
          if (saved) {
            const savedData = JSON.parse(saved);
            setIsReadOnly(savedData.isReadOnly || false);
            setHistoryId(savedData.history_id || null);

            if (savedData.answer_histories) {
              const restoredAnswers = {};

              const findLabelById = (answerId) => {
                if (!answerId || !backendTest?.receptive_test?.receptive_parts) return null;
                for (const part of backendTest.receptive_test.receptive_parts) {
                  for (const q of part.receptive_questions) {
                    const found = q.receptive_answers?.find(
                      (a) => a.id === answerId || a.id === parseInt(answerId),
                    );
                    if (found) return found.option_label;
                  }
                }
                return null;
              };

              savedData.answer_histories.forEach((hist) => {
                const questionId = hist.receptive_question || hist.question_id;
                let value =
                  hist.receptive_answer || hist.selected_answer_id || hist.user_answer_text;

                if (hist.receptive_answer || hist.selected_answer_id) {
                  const label = findLabelById(hist.receptive_answer || hist.selected_answer_id);
                  if (label) value = label;
                }

                restoredAnswers[questionId] = value;
              });
              setAnswers(restoredAnswers);
              if (savedData.startTime) setStartTime(savedData.startTime);
              if (savedData.totalTime) setElapsedSeconds(savedData.totalTime);
            }
          }
        }
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

  const handleSubmit = (type = 'S') => {
    const hasAnswer = Object.values(answers).some(
      (val) => val !== '' && val !== null && val !== undefined,
    );

    if (!hasAnswer && type === 'S') {
      setOpenWarningDialog(true);
      return;
    }

    setSubmitType(type);
    setOpenSubmitDialog(true);
  };

  const handleConfirmSubmit = async () => {
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setSnackbar({
          open: true,
          message: 'Please login to submit your test.',
          severity: 'warning',
        });
        setTimeout(() => {
          router.push(`/student/reading/${testId}`);
        }, 1500);
        setIsSubmitting(false);
        return;
      }

      const endTime = new Date().toISOString();
      const answer_histories = [];

      testData.parts.forEach((part) => {
        part.rawPart.receptive_questions.forEach((q) => {
          const userAnswer = answers[q.id];

          if (userAnswer !== null && userAnswer !== undefined && userAnswer !== '') {
            const entry = { receptive_question: q.id };

            if (['F', 'G', 'A', 'B', 'C', 'H', 'E', 'J'].includes(part.format)) {
              let selectedAnswer = q.receptive_answers.find(
                (a) =>
                  a.option_label === userAnswer ||
                  a.id === userAnswer ||
                  a.id === parseInt(userAnswer),
              );

              if (!selectedAnswer && typeof userAnswer === 'string' && userAnswer.length === 1) {
                const allAnswers = [...(q.receptive_answers || [])].sort((a, b) => {
                  if (a.option_label && b.option_label)
                    return a.option_label.localeCompare(b.option_label);
                  return a.id - b.id;
                });
                const answerIndex = userAnswer.toUpperCase().charCodeAt(0) - 65;
                if (answerIndex >= 0 && answerIndex < allAnswers.length) {
                  selectedAnswer = allAnswers[answerIndex];
                }
              }

              if (!selectedAnswer && (part.format === 'J' || part.format === 'E')) {
                const allPossibleAnswers = [];
                const seenAnswerIds = new Set();

                part.rawPart.receptive_questions.forEach((rq) => {
                  (rq.receptive_answers || []).forEach((ra) => {
                    if (!seenAnswerIds.has(ra.id)) {
                      seenAnswerIds.add(ra.id);
                      allPossibleAnswers.push(ra);
                    }
                  });
                });

                allPossibleAnswers.sort((a, b) => {
                  if (a.option_label && b.option_label)
                    return a.option_label.localeCompare(b.option_label);
                  return a.id - b.id;
                });

                selectedAnswer = allPossibleAnswers.find(
                  (a) =>
                    a.option_label === userAnswer ||
                    a.id === userAnswer ||
                    a.id === parseInt(userAnswer),
                );

                if (!selectedAnswer && typeof userAnswer === 'string' && userAnswer.length === 1) {
                  const answerIndex = userAnswer.toUpperCase().charCodeAt(0) - 65;
                  if (answerIndex >= 0 && answerIndex < allPossibleAnswers.length) {
                    selectedAnswer = allPossibleAnswers[answerIndex];
                  }
                }
              }

              if (selectedAnswer) {
                entry.receptive_answer = selectedAnswer.id;
              } else {
                entry.user_answer_text = String(userAnswer);
              }
            } else {
              entry.user_answer_text = String(userAnswer);
            }

            answer_histories.push(entry);
          }
        });
      });

      const payload = {
        receptive_test: testData.id,
        type: submitType,
        start_time: startTime,
        end_time: endTime,
        total_time: elapsedSeconds,
        answer_histories,
      };

      const response = await createReceptiveTest(payload, token);
      setOpenSubmitDialog(false);

      setSnackbar({
        open: true,
        message: submitType === 'S' ? 'Test submitted successfully!' : 'Draft saved successfully!',
        severity: 'success',
      });

      if (submitType === 'S') {
        const dataToSave = {
          history_id: response.id,
          answer_histories: response.answer_histories || [],
          isReadOnly: true,
          startTime: response.start_time,
          totalTime: response.total_time,
          bonus_point: response.bonus_point,
          earned_bonus_point: response.earned_bonus_point,
          total_score: response.total_score,
          feedback_message: response.feedback_message,
        };
        window.sessionStorage.setItem('current_receptive_attempt', JSON.stringify(dataToSave));
        setIsReadOnly(true);
        setHistoryId(response.id);
      } else {
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            window.sessionStorage.removeItem('current_receptive_attempt');
          }
          router.push(`/student/reading/${testId}`);
        }, 1000);
      }
    } catch (err) {
      console.error('Submission error:', err);
      let errorMessage = err.message || 'Unknown error';
      if (err.data && typeof err.data === 'object') {
        errorMessage = JSON.stringify(err.data, null, 2);
      }
      setSnackbar({
        open: true,
        message: 'Failed to submit test: ' + errorMessage,
        severity: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
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

  // Trạng thái Loading hoặc Lỗi
  if (loading) {
    return <Skeleton />;
  }

  // Kết quả sau khi nộp bài
  if (isReadOnly && historyId) {
    return <ReceptiveTestResult historyId={historyId} testId={testId} />;
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

  // Hàm render Component con (Không chứa Footer hay Header)
  const renderPartComponent = () => {
    const commonProps = {
      answers,
      onAnswerChange: handleAnswerChange,
      showResults: isReadOnly,
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
            questions={currentPart.data.questions}
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

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'background.paper',
      }}
    >
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{
            width: '100%',
            borderRadius: '12px',
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      {/* KHỐI 1: TEST HEADING & TABS - ĐÃ ĐỒNG BỘ THEO LISTENING */}
      {/* -------- Test Heading Section --------- */}
      <Box
        maxWidth="lg"
        sx={{
          ...listeningtestStyles.testHeadingContainer,
          mx: 'auto',
          backgroundColor: 'background.paper',
        }}
      >
        {/* Time Left */}
        <Box sx={{ ...listeningtestStyles.timeLeft, ...(isReadOnly && { visibility: 'hidden' }) }}>
          <AccessTimeIcon sx={{ fontSize: 28, mr: 0.5 }} />
          {formatTimeFromSeconds(elapsedSeconds)}
        </Box>

        {/* Name Test and Format Part */}
        <Box sx={listeningtestStyles.nameTestAndFormatPart}>
          <Typography sx={listeningtestStyles.nameTest}>{testData.title}</Typography>
          <Typography sx={listeningtestStyles.formatName}>
            Part {currentPartIndex + 1}: {currentPart.componentType.replace('-', ' ')}
          </Typography>
        </Box>

        {/* Submit và Draft Button */}
        <Box
          sx={{
            ...listeningtestStyles.summitButtonWrapper,
            ...(isReadOnly && { visibility: 'hidden' }),
          }}
        >
          <Button
            startIcon={<SaveOutlinedIcon />}
            sx={listeningtestStyles.draftButton}
            onClick={() => handleSubmit('D')}
            disabled={isReadOnly}
          >
            Save Draft
          </Button>
          <Button
            startIcon={<SendIcon />}
            sx={listeningtestStyles.submitButton}
            onClick={() => handleSubmit('S')}
            disabled={isReadOnly}
          >
            Submit Test
          </Button>
        </Box>
      </Box>
      {/* -------- List Part Selection --------- */}
      <Box maxWidth="lg" sx={{ ...listeningtestStyles.listPartContainer, mx: 'auto' }}>
        {testData.parts.map((part, index) => (
          <Box
            key={index}
            onClick={() => setCurrentPartIndex(index)}
            sx={{
              ...listeningtestStyles.boxPart,
              ...(index === currentPartIndex && {
                backgroundColor: 'background.default',
                borderColor: 'orange.light',
                color: 'orange.dark',
              }),
              // Responsive Logic: Ẩn bớt tab trên mobile giống Listening
              ...((index < currentPartIndex - 1 || index > currentPartIndex + 1) && {
                display: { xs: 'none', sm: 'flex' },
              }),
              ...(((index === currentPartIndex - 2 &&
                currentPartIndex === testData.parts.length - 1) ||
                (index === currentPartIndex + 2 && currentPartIndex === 0)) && {
                display: 'flex',
              }),
            }}
          >
            Part {index + 1}
          </Box>
        ))}
      </Box>
      {/* Separator Line */}
      <Box sx={{ ...listeningtestStyles.separatorLine, backgroundColor: 'gray.main' }} />{' '}
      {/* KHỐI 2: CONTENT CỦA PART */}
      <Box sx={{ width: '100%', flex: 1, display: 'flex', bgcolor: 'background.default' }}>
        {renderPartComponent()}
      </Box>
      {/* KHỐI 3: STEPPER NAVIGATION Ở DƯỚI CÙNG */}
      <Box sx={{ width: '100%', height: 'auto', backgroundColor: 'background.gray', pb: 4 }}>
        <Container maxWidth="lg" sx={listeningtestStyles.stepperContainer}>
          <Typography
            sx={{
              ...listeningtestStyles.backButton,
              // Thêm logic display: Ẩn hẳn (none) trên mobile (xs) khi ở trang đầu để chữ Section dạt ra sát mép trái
              display: currentPartIndex === 0 ? { xs: 'none', md: 'flex' } : 'flex',
              visibility: currentPartIndex === 0 ? 'hidden' : 'visible',
            }}
            onClick={handleBack}
          >
            <ExpandLessIcon
              sx={{
                cursor: 'pointer',
                fontSize: { xs: '1.6rem', md: '1.8rem' },
                color: 'gray.main',
                transform: 'rotate(270deg)',
              }}
            />
            Prev
          </Typography>

          <Typography sx={{ fontSize: '1rem' }}>
            Section {currentPartIndex + 1} of {testData.parts.length}
          </Typography>

          <Box
            sx={{
              ...listeningtestStyles.summitButtonWrapper,
              // Thêm logic display: Ẩn hẳn Box wrapper này trên mobile (xs) khi ở trang cuối để chữ Section dạt ra sát mép phải
              display:
                currentPartIndex === testData.parts.length - 1
                  ? { xs: 'none', md: 'flex' }
                  : 'flex',
            }}
          >
            {currentPartIndex !== testData.parts.length - 1 && (
              <Button sx={listeningtestStyles.nextButton} onClick={handleNext}>
                Next
              </Button>
            )}
          </Box>
        </Container>
      </Box>{' '}
      {/* --- CÁC DIALOG XÁC NHẬN --- */}
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
              {submitType === 'S'
                ? 'Are you sure you want to submit?'
                : 'Are you sure you want to save this draft?'}
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
              '&.Mui-disabled': { backgroundColor: '#166534', opacity: 0.7 },
            }}
          >
            {isSubmitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : submitType === 'S' ? (
              'SUBMIT'
            ) : (
              'SAVE DRAFT'
            )}
          </Button>
        </DialogActions>
      </Dialog>
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
            sx={{ color: '#94a3b8', '&:hover': { backgroundColor: '#f1f5f9', color: '#475569' } }}
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
              sx={{ fontSize: '1rem', color: '#475569', px: 2, fontFamily: '"Outfit", sans-serif' }}
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
    </Box>
  );
}
