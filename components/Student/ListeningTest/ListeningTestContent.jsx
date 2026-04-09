/* eslint-env browser */
/* eslint-disable no-console */
/* global setInterval, clearInterval */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Button,
  Snackbar,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
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
    setOpenConfirm(false);
    try {
      const formattedHistories = transformAnswers(allAnswers);

      const payload = {
        receptive_test: testHistory.receptive_test || test_id,
        type: submitType,
        start_time: testHistory.start_time,
        end_time: new Date().toISOString(),
        answer_histories: formattedHistories,
      };

      await createReceptiveTest(payload);

      setSnackbar({
        open: true,
        message: submitType === 'S' ? 'Test submitted successfully!' : 'Draft saved successfully!',
        severity: 'success',
      });

      if (submitType === 'S') {
        setTimeout(() => {
          router.push(`/student/listening/${test_id}`);
        }, 1000);
      } else {
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            window.sessionStorage.removeItem('current_receptive_attempt');
          }
          router.push(`/student/listening/${test_id}`);
        }, 1000);
      }
    } catch (error) {
      console.error('Draft save error:', error);
      if (error.status === 400) {
        setSnackbar({
          open: true,
          message: 'Invalid data. Please check your request.',
          severity: 'error',
        });
      } else if (error.status === 403) {
        setSnackbar({
          open: true,
          message: 'You do not have permission to perform this action.',
          severity: 'error',
        });
      } else if (error.status === 401) {
        setSnackbar({
          open: true,
          message: 'Authentication required. Please log in again.',
          severity: 'error',
        });
      }
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

  if (isInitial) {
    return <Skeleton />;
  }

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

  const handleFireworkComplete = () => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem('current_receptive_attempt');
    }
    router.push(`/student/listening/${test_id}`);
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
        onClose={() => setOpenConfirm(false)}
        PaperProps={{
          sx: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            padding: '16px',
            borderRadius: '12px',
          },
        }}
      >
        <DialogTitle sx={listeningtestStyles.nameTest}>
          {submitType === 'S' ? 'Finish Test?' : 'Submit as Draft?'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {submitType === 'S' ? (
              <>
                You have completed all questions. Do you want to{' '}
                <strong>submit and finish the test</strong>?
              </>
            ) : (
              <>
                You haven't finished all questions. Do you want to{' '}
                <strong>save your progress as a draft</strong> and continue later?
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenConfirm(false)}
            color="inherit"
            sx={{
              fontSize: { xs: '0.7rem', md: '1rem' },
              fontWeight: 500,
              textTransform: 'none',
              whiteSpace: 'nowrap',
              px: 2.5,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            autoFocus
            sx={listeningtestStyles.submitButton}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
      <Container maxWidth="lg">
        {/* -------- Test Heading Section --------- */}
        <Box sx={listeningtestStyles.testHeadingContainer}>
          <Box sx={listeningtestStyles.timeLeft}>
            <AccessTimeIcon
              sx={{
                color: 'secondary.main',
                fontSize: { xs: '1rem', md: '1.5rem' },
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
            <Button sx={listeningtestStyles.submitButton} onClick={handlePreSubmit}>
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
              <Button sx={listeningtestStyles.nextButton} onClick={handlePreSubmit}>
                Submit
              </Button>
            )}
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
