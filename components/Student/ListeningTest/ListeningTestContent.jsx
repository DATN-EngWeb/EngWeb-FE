/* eslint-env browser */
/* eslint-disable no-console */
/* global setInterval, clearInterval */
'use client';

import { useEffect, useState } from 'react';
import SendIcon from '@mui/icons-material/Send';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Button,
  Snackbar,
  Alert,
  DialogTitle,
  IconButton,
  CircularProgress,
  Stack,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { getReceptiveTestDetails } from '../../../api/teacher/upload-reading';
import { createReceptiveTest } from '../../../api/test';
import { listeningtestStyles } from '../../../styles/student/Listening/listeningTestStyles';
import {
  loadAudioSource,
  loadImageSource,
  fetchHtmlContent,
} from '../../../api/teacher/upload-reading';
import { getListeningTestTypeLabel, formatTimeFromMinutes } from '../../../utils/stringFormat';
import MultipleChoiceImagePart from './part/multipleChoiceImage';
import FillBlankPart from './part/fillBlanks';
import MultipleChoiceSingleAudio from './part/multipleChoiceSingleAudio';
import MultipleChoiceQuestionAudio from './part/multipleChoiceMultiQuestionAudio';
import Matching from './part/matching';
import Skeleton from './skeleton';
import ReceptiveTestResult from '../ReceptiveTestResult/ReceptiveTestResult';

export default function ListeningTestContent({ test_id, initialData }) {
  const router = useRouter();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [isInitial, setIsInitial] = useState(true);

  const [testData, setTestData] = useState(initialData || null);
  const [receptiveParts, setReceptiveParts] = useState([]);
  const [mediaResources, setMediaResources] = useState({});
  const [indexPart, setIndexPart] = useState(0);
  const [timeLeft, setTimeLeft] = useState(testData?.time || 0);
  const [allAnswers, setAllAnswers] = useState({});

  const [openConfirm, setOpenConfirm] = useState(false);
  const [submitType, setSubmitType] = useState('D');

  const [testHistory, setTestHistory] = useState({
    receptive_test: null,
    type: 'D',
    start_time: '2026-02-25T10:00:00Z',
    end_time: null,
    answer_histories: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [submittedHistoryId, setSubmittedHistoryId] = useState(null);

  const transformAnswers = (answersObj) => {
    const result = [];

    Object.values(answersObj).forEach((questions) => {
      Object.entries(questions).forEach(([questionId, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          const historyItem = {
            receptive_question: questionId,
          };

          if (typeof value === 'number') {
            historyItem.receptive_answer = value;
          } else {
            historyItem.user_answer_text = value;
          }

          result.push(historyItem);
        }
      });
    });

    return result;
  };

  const checkCompletionStatus = (testData, allAnswers) => {
    let totalQuestions = 0;
    testData.receptive_test.receptive_parts.forEach((part) => {
      totalQuestions += part.receptive_questions.length;
    });

    let totalAnswered = 0;
    Object.values(allAnswers).forEach((partAnswers) => {
      Object.values(partAnswers).forEach((answer) => {
        // Kiểm tra giá trị có "thực" hay không:
        // 1. Không null/undefined
        // 2. Nếu là string thì không được chỉ có khoảng trắng
        // 3. Nếu là array (trường hợp chọn nhiều) thì length > 0
        if (
          answer !== null &&
          answer !== undefined &&
          (typeof answer === 'string' ? answer.trim() !== '' : true) &&
          (Array.isArray(answer) ? answer.length > 0 : true)
        ) {
          totalAnswered += 1;
        }
      });
    });

    return totalQuestions === totalAnswered ? 'S' : 'D';
  };

  const handlePreSubmit = () => {
    const currentType = checkCompletionStatus(testData, allAnswers);
    setSubmitType(currentType);
    setOpenConfirm(true);
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const formattedHistories = transformAnswers(allAnswers);

      const payload = {
        receptive_test: testHistory.receptive_test || test_id,
        type: submitType,
        start_time: testHistory.start_time,
        end_time: new Date().toISOString(),
        answer_histories: formattedHistories,
      };

      const response = await createReceptiveTest(payload);

      setOpenConfirm(false);
      setSnackbar({
        open: true,
        message: submitType === 'S' ? 'Test submitted successfully!' : 'Draft saved successfully!',
        severity: 'success',
      });

      if (submitType === 'S') {
        setSubmittedHistoryId(response.id);
      } else {
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            window.sessionStorage.removeItem('current_receptive_attempt');
          }
          router.push(`/student/listening/${test_id}`);
        }, 1000);
      }
    } catch (error) {
      console.error('Submission error:', error);
      setSnackbar({
        open: true,
        message: 'Failed to submit test. Please try again.',
        severity: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    let loadedResources = {};
    const fetchTestData = async () => {
      if (!test_id) return;
      try {
        setIsInitial(true);
        const svData = await getReceptiveTestDetails(test_id);
        const parts = svData.receptive_test.receptive_parts || [];

        const resourcesMap = {};
        const preloadPromises = parts.map(async (part) => {
          resourcesMap[part.id] = {
            audioSrc: null,
            imageSrcs: {},
            audioSrcs: {},
            passageSrc: null,
          };
          const res = resourcesMap[part.id];

          // Tải Audio chung của Part (Dùng cho format A, C, D, E)
          const partAudio = part.audio?.url || part.resources?.audio;
          if (partAudio) {
            res.audioSrc = partAudio.startsWith('blob:')
              ? partAudio
              : await loadAudioSource(partAudio);
          }

          // Tải Nội dung HTML chung (Dùng cho format C, D)
          if (part.content) {
            res.passageSrc = await fetchHtmlContent(part.content);
          }

          // Tải tài nguyên chi tiết theo từng Format đặc thù
          if (part.format === 'A') {
            // Tải mảng hình ảnh cho các đáp án
            const imgPromises = [];
            part.receptive_questions?.forEach((q) => {
              q.receptive_answers?.forEach((opt) => {
                const imgUrl = opt.image?.url || opt.resources?.image;
                if (imgUrl) {
                  imgPromises.push(async () => {
                    res.imageSrcs[opt.id] = imgUrl.startsWith('blob:')
                      ? imgUrl
                      : await loadImageSource(imgUrl);
                  });
                }
              });
            });
            await Promise.all(imgPromises.map((p) => p()));
          } else if (part.format === 'B') {
            // Tải mảng audio cho từng câu hỏi
            const audioPromises = [];
            part.receptive_questions?.forEach((q) => {
              const qAudio = q.audio?.url || q.resources?.audio;
              if (qAudio) {
                audioPromises.push(async () => {
                  res.audioSrcs[q.id] = qAudio.startsWith('blob:')
                    ? qAudio
                    : await loadAudioSource(qAudio);
                });
              }
            });
            await Promise.all(audioPromises.map((p) => p()));
          }
        });

        await Promise.all(preloadPromises);
        loadedResources = resourcesMap;
        setMediaResources(resourcesMap);

        setTestData(svData);
        setReceptiveParts(parts);
        setTimeLeft(svData.time * 60);

        if (typeof window !== 'undefined') {
          const saved = window.sessionStorage.getItem('current_receptive_attempt');

          if (saved) {
            const savedData = JSON.parse(saved);
            const restoredAnswers = {};

            savedData.answer_histories.forEach((hist) => {
              const parentPart = svData.receptive_test.receptive_parts.find((part) =>
                part.receptive_questions.some((q) => q.id === hist.question_id),
              );

              if (parentPart) {
                const pId = parentPart.id;
                if (!restoredAnswers[pId]) restoredAnswers[pId] = {};

                restoredAnswers[pId][hist.question_id] =
                  hist.selected_answer_id || hist.user_answer_text;
              }
            });

            setAllAnswers(restoredAnswers);

            setTestHistory({
              receptive_test: svData.id,
              start_time: savedData.startTime || new Date().toISOString(),
              type: savedData.isReadOnly ? 'S' : 'D',
              answer_histories: transformAnswers(restoredAnswers),
            });
          } else {
            setTestHistory({
              receptive_test: svData.id,
              start_time: new Date().toISOString(),
            });
          }
        }
      } catch (error) {
        console.error('Lỗi tải dữ liệu bài thi:', error);
      } finally {
        setIsInitial(false);
      }
    };

    fetchTestData();

    return () => {
      Object.values(loadedResources).forEach((res) => {
        if (res.audioSrc?.startsWith('blob:')) URL.revokeObjectURL(res.audioSrc);
        Object.values(res.imageSrcs).forEach((url) => {
          if (url?.startsWith('blob:')) URL.revokeObjectURL(url);
        });
        Object.values(res.audioSrcs).forEach((url) => {
          if (url?.startsWith('blob:')) URL.revokeObjectURL(url);
        });
      });
    };
  }, [test_id]);

  // Timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const goNextPart = () => {
    if (indexPart < receptiveParts.length - 1) {
      window.scrollTo({ top: 64, behavior: 'smooth' });
      setIndexPart(indexPart + 1);
    }
  };

  const goPrevPart = () => {
    if (indexPart > 0) {
      window.scrollTo({ top: 64, behavior: 'smooth' });
      setIndexPart(indexPart - 1);
    }
  };

  // Hàm cập nhật câu trả lời người dùng
  const handleUpdateAnswers = (partId, answers) => {
    setAllAnswers((prev) => ({
      ...prev,
      [partId]: answers,
    }));
  };

  const renderPart = (part, index) => {
    // - 'A': Listening - Multiple choice images
    // - 'B': Listening - Multiple choice text (one audio per question)
    // - 'C': Listening - Multiple choice text (one audio for all question)
    // - 'D': Listening - Fill in the blank (text)
    // - 'E': Listening - Matching

    const isActive = indexPart === index;

    const commonProps = {
      dataPart: part,
      isActive: isActive,
      userAnswers: allAnswers[part.id] || {},
      onUpdateAnswers: (answers) => handleUpdateAnswers(part.id, answers),
      media: mediaResources[part.id] || {},
    };

    switch (part.format) {
      case 'A':
        return <MultipleChoiceImagePart key={part.id} {...commonProps} />;
      case 'B':
        return <MultipleChoiceSingleAudio key={part.id} {...commonProps} />;
      case 'C':
        return <MultipleChoiceQuestionAudio key={part.id} {...commonProps} />;
      case 'D':
        return <FillBlankPart key={part.id} {...commonProps} />;
      case 'E':
        return <Matching key={part.id} {...commonProps} />;
      default:
        return null;
    }
  };

  if (submittedHistoryId) {
    return <ReceptiveTestResult historyId={submittedHistoryId} />;
  }

  if (isInitial) {
    return <Skeleton />;
  }

  return (
    <Box sx={{ ...listeningtestStyles.mainContainer, position: 'relative' }}>
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
      <Dialog
        open={openConfirm}
        onClose={() => !isSubmitting && setOpenConfirm(false)}
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
          onClick={() => setOpenConfirm(false)}
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
                backgroundColor: submitType === 'S' ? '#f0fdf4' : '#fffbeb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `1px solid ${submitType === 'S' ? '#dcfce7' : '#fef3c7'}`,
              }}
            >
              <InfoOutlinedIcon
                sx={{ fontSize: 48, color: submitType === 'S' ? '#16a34a' : '#f59e0b' }}
              />
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
                : 'Do you want to save your progress as a draft?'}
            </Typography>
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{ 界面: 'center', gap: 3, pb: 6, pt: 2, px: 4, justifyContent: 'center' }}
        >
          <Button
            onClick={() => setOpenConfirm(false)}
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
            onClick={handleSubmit}
            variant="contained"
            disabled={isSubmitting}
            sx={{
              borderRadius: '50px',
              px: isSubmitting ? 6 : 4,
              py: 1.5,
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.875rem',
              backgroundColor: submitType === 'S' ? '#166534' : '#f59e0b',
              color: '#ffffff',
              fontFamily: '"Outfit", sans-serif',
              boxShadow: `0 4px 14px 0 ${submitType === 'S' ? 'rgba(22, 101, 52, 0.39)' : 'rgba(245, 158, 11, 0.39)'}`,
              '&:hover': {
                backgroundColor: submitType === 'S' ? '#14532d' : '#d97706',
                boxShadow: `0 6px 20px ${submitType === 'S' ? 'rgba(22, 101, 52, 0.23)' : 'rgba(245, 158, 11, 0.23)'}`,
              },
              '&.Mui-disabled': {
                backgroundColor: submitType === 'S' ? '#166534' : '#f59e0b',
                opacity: 0.7,
              },
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
      <Container maxWidth="lg">
        {/* -------- Test Heading Section --------- */}
        <Box sx={listeningtestStyles.testHeadingContainer}>
          <Box sx={listeningtestStyles.timeLeft}>
            <AccessTimeIcon
              sx={{
                fontSize: 28,
                mr: 0.5,
              }}
            />
            {formatTimeFromMinutes(timeLeft / 60)}
          </Box>
          <Box sx={listeningtestStyles.nameTestAndFormatPart}>
            <Typography sx={listeningtestStyles.nameTest}>{testData?.title}</Typography>
            <Typography sx={listeningtestStyles.formatName}>
              {`Part ${indexPart + 1}: `}
              {getListeningTestTypeLabel(receptiveParts[indexPart]?.format)}
            </Typography>
          </Box>
          <Box sx={listeningtestStyles.summitButtonWrapper}>
            <Button
              startIcon={<SendIcon />}
              sx={listeningtestStyles.submitButton}
              onClick={handlePreSubmit}
            >
              Submit Test
            </Button>
          </Box>
        </Box>
        <Box sx={listeningtestStyles.separatorLine}></Box>
        {/* -------- List Part Selection --------- */}
        <Box sx={listeningtestStyles.listPartContainer}>
          {receptiveParts.map((part, index) => (
            <Box
              sx={{
                ...listeningtestStyles.boxPart,
                ...(index === indexPart && {
                  backgroundColor: 'background.default',
                  borderColor: 'orange.light',
                  color: 'orange.dark',
                }),
                ...((index < indexPart - 1 || index > indexPart + 1) && {
                  display: { xs: 'none', sm: 'flex' },
                }),
                ...(((index === indexPart - 2 && indexPart === receptiveParts.length - 1) ||
                  (index === indexPart + 2 && indexPart === 0)) && {
                  display: 'flex',
                }),
              }}
              key={part.id}
              onClick={() => setIndexPart(index)}
            >
              Part {index + 1}
            </Box>
          ))}
        </Box>
        <Box sx={{ ...listeningtestStyles.separatorLine, backgroundColor: 'gray.main' }}></Box>
      </Container>
      {/* -------- Part Content Section --------- */}
      <Box sx={{ width: '100%', height: 'auto', backgroundColor: 'background.gray' }}>
        {receptiveParts.map((part, index) => renderPart(part, index))}
      </Box>
      {/* -------- Stepper Section --------- */}
      <Box sx={{ width: '100%', height: 'auto', backgroundColor: 'background.gray' }}>
        <Container maxWidth="lg" sx={listeningtestStyles.stepperContainer}>
          <Typography
            sx={{
              ...listeningtestStyles.backButton,
              visibility: indexPart === 0 ? 'hidden' : 'visible',
            }}
            onClick={goPrevPart}
          >
            <ExpandLessIcon
              sx={{
                cursor: 'pointer',
                fontSize: { xs: '1.6rem', md: '1.8rem' },
                color: 'gray.main',
                transform: 'rotate(270deg)',
              }}
            />
            Back
          </Typography>
          <Typography sx={{ fontSize: '1rem' }}>
            Section {indexPart + 1} of {receptiveParts.length}
          </Typography>
          <Box sx={listeningtestStyles.summitButtonWrapper}>
            {indexPart !== receptiveParts.length - 1 ? (
              <Button sx={listeningtestStyles.nextButton} onClick={goNextPart}>
                Next
              </Button>
            ) : (
              <Button
                startIcon={<SendIcon />}
                sx={{ ...listeningtestStyles.submitButton, px: 3, py: 0.5 }}
                onClick={handlePreSubmit}
              >
                Submit
              </Button>
            )}
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
