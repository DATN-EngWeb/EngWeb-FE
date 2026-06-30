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
  IconButton,
  CircularProgress,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import { getReceptiveTestDetails } from '../../../api/teacher/upload-reading';
import { getFullReceptiveTestReview } from '@/api/tests';
import { createReceptiveTest } from '../../../api/test';
import { listeningtestStyles } from '@/styles/Student/Listening/listeningTestStyles';
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
import SummaryTab from './part/sumaryTab';
import { useStreakContext } from '@/context/streakContext';
import SubmitLoadingDialog from '../../Writing-Speaking/SubmitLoadingDialog';
import SaveDraftToast from '../../Writing-Speaking/SaveDraftToast';
import useUnsavedChangesWarning from '@/hooks/useUnsavedChangesWarning';
import ListPartTab from '@/components/Student/Common/ListPartTab';
import { getListeningPartProgress, getVisibleTabs } from '@/utils/partProgress';

export default function ListeningTestContent({ test_id, initialData }) {
  const router = useRouter();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [isInitial, setIsInitial] = useState(true);

  const [testData, setTestData] = useState(initialData || null);
  const [receptiveParts, setReceptiveParts] = useState([]);
  const [mediaResources, setMediaResources] = useState({});
  const [indexPart, setIndexPart] = useState(0);
  const [visitedParts, setVisitedParts] = useState(new Set([0]));
  const [startTime, setStartTime] = useState(testData?.total_time || 0);
  const [allAnswers, setAllAnswers] = useState({});

  const [isReadOnly, setIsReadOnly] = useState(false);
  const [detailAnswers, setDetailAnswers] = useState([]);
  const [staticData, setStaticData] = useState({
    bonus_point: 0,
    earned_bonus_point: 0,
    total_score: 0,
    feedback_message: '',
  });

  const [openConfirm, setOpenConfirm] = useState(false);
  const [submitType, setSubmitType] = useState('D');

  const [testHistory, setTestHistory] = useState({
    receptive_test: null,
    type: 'D',
    start_time: '2026-02-25T10:00:00Z',
    end_time: null,
    total_time: 0,
    answer_histories: [],
  });

  const [submitStatus, setSubmitStatus] = useState('idle');
  const [draftStatus, setDraftStatus] = useState('idle');
  const [targetQuestionId, setTargetQuestionId] = useState(null);

  const { refreshStreak, setGlobalRewardData } = useStreakContext();

  useUnsavedChangesWarning(
    !isReadOnly && submitStatus !== 'submitting' && draftStatus !== 'saving',
  );

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

    const unanswered = totalQuestions - totalAnswered;
    return { status: unanswered === 0 ? 'S' : 'D', unanswered };
  };

  const handlePreSubmit = () => {
    setSubmitType('S');
    setOpenConfirm(true);
  };

  const handlePreSaveDraft = () => {
    setSubmitType('D');
    handleSubmit('D');
  };

  const handleSubmit = async (overrideType) => {
    const finalSubmitType = typeof overrideType === 'string' ? overrideType : submitType;

    try {
      if (finalSubmitType === 'S') {
        setSubmitStatus('submitting');
      } else {
        setDraftStatus('saving');
      }
      setOpenConfirm(false);

      const formattedHistories = transformAnswers(allAnswers);

      const payload = {
        receptive_test: testHistory.receptive_test || test_id,
        type: finalSubmitType,
        start_time: testHistory.start_time,
        end_time: new Date().toISOString(),
        total_time: startTime,
        answer_histories: formattedHistories,
      };

      const token = localStorage.getItem('accessToken');
      const [response] = await Promise.all([
        createReceptiveTest(payload, token),
        finalSubmitType === 'S'
          ? new Promise((resolve) => setTimeout(resolve, 1500))
          : Promise.resolve(),
      ]);

      if (finalSubmitType === 'S') {
        setSubmitStatus('idle'); // Just close it, because we instantly show the results

        if (response?.streak_reward_notice) {
          setGlobalRewardData(response.streak_reward_notice);
        } else if (
          response?.streak_notice?.current_streak === 1 &&
          response?.streak_notice?.is_first_submission_today === true
        ) {
          setGlobalRewardData(response.streak_notice);
        }

        const dataToSave = {
          answer_histories: response.answer_histories || [],
          attempt: response.attempt || 1,
          isReadOnly: response.type === 'S',
          startTime: response.start_time,
          totalTime: response.total_time,
          bonus_point: response.bonus_point,
          earned_bonus_point: response.earned_bonus_point,
          total_score: response.total_score,
          feedback_message: response.feedback_message,
        };

        const stringifiedData = JSON.stringify(dataToSave);
        window.sessionStorage.setItem('current_receptive_attempt', stringifiedData);
        setIsInitial(true);
        setIndexPart(0);

        // Dispatch event to refetch profile in Header
        if (typeof window !== 'undefined') {
          // eslint-disable-next-line no-undef
          window.dispatchEvent(new Event('profile-updated'));
        }

        await refreshStreak();
      } else {
        setDraftStatus('saved');
      }
    } catch (error) {
      console.error('Submission error:', error);
      if (finalSubmitType === 'S') {
        setSubmitStatus('error');
      } else {
        setDraftStatus('error');
      }
    }
  };

  const handleCloseSubmitDialog = () => {
    setSubmitStatus('idle');
  };

  const handleCloseDraftToast = () => {
    setDraftStatus('idle');
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem('current_receptive_attempt');
    }
    router.push(`/student/listening/${test_id}`);
  };

  const handleSaveDraftRetry = () => {
    setDraftStatus('idle');
    handleSubmit();
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    let loadedResources = {};
    const fetchTestData = async () => {
      if (!test_id) return;
      try {
        let isReviewMode = false;
        let savedData = null;

        if (typeof window !== 'undefined') {
          const saved = window.sessionStorage.getItem('current_receptive_attempt');
          if (saved) {
            savedData = JSON.parse(saved);
            if (savedData.isReadOnly) {
              isReviewMode = true;
            }
          }
        }

        let svData;
        if (isReviewMode) {
          svData = await getFullReceptiveTestReview(test_id);
        } else {
          svData = await getReceptiveTestDetails(test_id);
        }

        if (savedData) {
          const restoredAnswers = {};

          if (svData?.receptive_test?.receptive_parts) {
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
          }

          setAllAnswers(restoredAnswers);

          setTestHistory({
            receptive_test: test_id,
            start_time: savedData.startTime || new Date().toISOString(),
            type: savedData.isReadOnly ? 'S' : 'D',
            answer_histories: transformAnswers(restoredAnswers),
          });

          setIsReadOnly(savedData.isReadOnly);
          setDetailAnswers(savedData.answer_histories);
          setStartTime(savedData.totalTime || 0);
          setStaticData({
            bonus_point: savedData.bonus_point,
            earned_bonus_point: savedData.earned_bonus_point,
            total_score: savedData.total_score,
            feedback_message: savedData.feedback_message,
          });
          if (savedData.isReadOnly) {
            setIndexPart(-1);
          }
        } else {
          setTestHistory({
            receptive_test: test_id,
            start_time: new Date().toISOString(),
          });
        }

        const parts = [...(svData?.receptive_test?.receptive_parts || [])]
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          .map((part) => {
            const sortedQuestions = [...(part.receptive_questions || [])]
              .sort((a, b) => (a.question_number ?? 0) - (b.question_number ?? 0))
              .map((q) => {
                const sortedAnswers = [...(q.receptive_answers || [])].sort((a, b) =>
                  (a.option_label || '').localeCompare(b.option_label || ''),
                );
                return { ...q, receptive_answers: sortedAnswers };
              });
            return { ...part, receptive_questions: sortedQuestions };
          });

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
  }, [test_id, isInitial]);

  // Timer
  useEffect(() => {
    if (isReadOnly) return;

    const timer = setInterval(() => {
      setStartTime((prev) => {
        const current = Number(prev) || 0;
        return current + 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isReadOnly]);

  const handleGoToPart = (index) => {
    setIndexPart(index);
    if (index >= 0) {
      setVisitedParts((prev) => new Set([...prev, index]));
    }
  };

  const goNextPart = () => {
    if (indexPart < receptiveParts.length - 1) {
      window.scrollTo({ top: 64, behavior: 'smooth' });
      handleGoToPart(indexPart + 1);
    }
  };

  const goPrevPart = () => {
    if (indexPart === 0 && isReadOnly) {
      window.scrollTo({ top: 64, behavior: 'smooth' });
      handleGoToPart(-1);
    } else if (indexPart > 0) {
      window.scrollTo({ top: 64, behavior: 'smooth' });
      handleGoToPart(indexPart - 1);
    }
  };

  const handleBack = () => {
    window.history.back();
  };

  // Hàm cập nhật câu trả lời người dùng
  const handleUpdateAnswers = (partId, answers) => {
    setAllAnswers((prev) => ({
      ...prev,
      [partId]: answers,
    }));
  };

  const handleNavigateToQuestion = (partIndex, questionId) => {
    setIndexPart(partIndex);
    setTargetQuestionId(questionId);
  };

  // Logic cuộn trang và nảy Container Question
  useEffect(() => {
    if (targetQuestionId && indexPart !== -1) {
      let retryCount = 0;
      const maxRetries = 15;

      const attemptScroll = () => {
        const element = document.getElementById(`question-${targetQuestionId}`);

        if (element && element.getBoundingClientRect().height > 0) {
          window.requestAnimationFrame(() => {
            // 1. Cuộn vào giữa màn hình
            element.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
            });

            // 2. CSS an toàn: CHỈ ĐẨY LÊN, KHÔNG ĐỔI MÀU
            if (!document.getElementById('safe-bounce-style')) {
              const style = document.createElement('style');
              style.id = 'safe-bounce-style';
              style.innerHTML = `
                @keyframes slightBounce {
                  0%, 100% { transform: translateY(0); }
                  50% { transform: translateY(-2px); } /* Đổi thành -1px nếu muốn nảy siêu nhẹ */
                }
                .safe-element-bounce {
                  animation: slightBounce 0.3s ease-in-out 2; /* Nảy 2 lần trong 0.6s */
                }
              `;
              document.head.appendChild(style);
            }

            // 3. Kịch bản nảy lên
            setTimeout(() => {
              element.classList.add('safe-element-bounce');

              // Dọn dẹp class sau khi animation hoàn thành (0.3s * 2 lần = 600ms)
              setTimeout(() => {
                element.classList.remove('safe-element-bounce');
              }, 600);
            }, 300); // Đợi cuộn ổn định rồi mới nảy
          });

          setTargetQuestionId(null);
        } else if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(attemptScroll, 100);
        }
      };

      const timer = setTimeout(attemptScroll, 200);
      return () => clearTimeout(timer);
    }
  }, [indexPart, targetQuestionId]);

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
      disabled: isReadOnly,
      detailAnswers: detailAnswers,
      onNavigateToQuestion: (questionId) => handleNavigateToQuestion(index, questionId),
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

  if (isInitial) {
    return <Skeleton />;
  }

  return (
    <Box
      sx={{
        ...listeningtestStyles.mainContainer,
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <SubmitLoadingDialog
        status={submitStatus}
        testType="listening"
        onClose={handleCloseSubmitDialog}
        onRetry={() => {
          setSubmitStatus('idle');
          handleSubmit();
        }}
      />

      <SaveDraftToast
        status={draftStatus}
        testType="listening"
        onClose={handleCloseDraftToast}
        onRetry={handleSaveDraftRetry}
      />

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
      {/* --------- Confirm Section --------- */}
      <Dialog
        open={openConfirm}
        onClose={() =>
          !(submitStatus === 'submitting' || draftStatus === 'saving') && setOpenConfirm(false)
        }
        PaperProps={{
          sx: {
            borderRadius: '20px',
            p: 1.5,
            maxWidth: '480px',
            width: '100%',
            position: 'relative',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            borderColor: 'warning.main',
            borderWidth: '1px',
            borderStyle: 'solid',
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
            color: 'primary.main',
            justifyContent: 'center',
            textAlign: 'center',
            position: 'relative',
            pt: 2,
            pb: 1,
          }}
        >
          {/* {submitType === 'D' ? 'Save Draft' : checkCompletionStatus(testData, allAnswers) === 'S' ? 'Submit Test' : ''} */}
          {submitType === 'D' ? 'Save Draft' : ''}
          <IconButton
            aria-label="close"
            onClick={() => setOpenConfirm(false)}
            sx={{ position: 'absolute', right: 1, top: 1, color: 'text.secondary' }}
            size="large"
            disabled={submitStatus === 'submitting' || draftStatus === 'saving'}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ textAlign: 'center', pt: 2, pb: 1 }}>
          <Stack spacing={3} alignItems="center">
            {submitType === 'S' && checkCompletionStatus(testData, allAnswers).status !== 'S' && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                size="large"
              >
                <WarningAmberIcon sx={{ fontSize: 48, color: '#ef6c00' }} />
              </Box>
            )}
            {submitType === 'S' && checkCompletionStatus(testData, allAnswers).status === 'S' && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                size="large"
              >
                <SendIcon sx={{ fontSize: 48, color: 'primary.main' }} />
              </Box>
            )}

            <Typography
              sx={{
                fontSize: '1.15rem',
                fontWeight: 700,
                color: 'primary.main',
                lineHeight: 1.4,
                px: 3,
                fontFamily: '"Outfit", sans-serif',
              }}
            >
              {submitType === 'S'
                ? checkCompletionStatus(testData, allAnswers).status === 'S'
                  ? 'Great job! Are you sure to submit your test?'
                  : `You have ${checkCompletionStatus(testData, allAnswers).unanswered} unanswered question(s). Do you still want to submit?`
                : 'Do you want to save your progress as a draft?'}
            </Typography>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ gap: 2, pb: 3.5, pt: 1.5, px: 3, justifyContent: 'center' }}>
          <Button
            onClick={() => setOpenConfirm(false)}
            variant="outlined"
            disabled={submitStatus === 'submitting' || draftStatus === 'saving'}
            sx={{
              borderRadius: '12px',
              px: 4,
              py: 1,
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.875rem',
              color: '#6d4c41',
              borderColor: '#d7ccc8',
              borderWidth: '1.5px',
              fontFamily: '"Outfit", sans-serif',
              '&:hover': {
                backgroundColor: '#fbe9e7',
                borderColor: '#bcaaa4',
                borderWidth: '1.5px',
              },
            }}
          >
            CANCEL
          </Button>

          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={submitStatus === 'submitting' || draftStatus === 'saving'}
            sx={{
              borderRadius: '12px',
              px: 4,
              py: 1,
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.875rem',
              backgroundColor: 'primary.main',
              color: '#ffffff',
              fontFamily: '"Outfit", sans-serif',
              boxShadow: '0 4px 14px 0 rgba(93, 64, 55, 0.39)',
              '&:hover': {
                backgroundColor: 'warning.main',
                boxShadow: '0 6px 20px rgba(93, 64, 55, 0.23)',
              },
            }}
          >
            {submitStatus === 'submitting' ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'SUBMIT NOW'
            )}
          </Button>
        </DialogActions>
      </Dialog>
      {/* -------- Test Heading Section --------- */}
      <Box
        maxWidth="lg"
        sx={{
          ...listeningtestStyles.testHeadingContainer,
          mx: 'auto',
        }}
      >
        {/* Time Left */}
        <Box
          sx={{
            ...listeningtestStyles.timeLeft,
            ...(isReadOnly && { visibility: 'hidden' }),
            ...(isReadOnly && { display: { xs: 'none', md: 'flex' } }),
          }}
        >
          <AccessTimeIcon
            sx={{
              fontSize: 28,
              mr: 0.5,
            }}
          />
          {formatTimeFromMinutes(startTime / 60)}
        </Box>
        {/* Name Test and Format Part */}
        <Box sx={listeningtestStyles.nameTestAndFormatPart}>
          <Typography sx={listeningtestStyles.nameTest}>{testData?.title}</Typography>
          <Typography sx={listeningtestStyles.formatName}>
            {indexPart === -1
              ? 'Summary'
              : `Part ${indexPart + 1}: ${getListeningTestTypeLabel(
                  receptiveParts[indexPart]?.format,
                )}`}
          </Typography>
        </Box>
        {/* Submit và Draft Button */}
        <Box
          sx={{
            ...listeningtestStyles.summitButtonWrapper,
            ...(isReadOnly && { visibility: 'hidden' }),
            ...(isReadOnly && { display: { xs: 'none', md: 'flex' } }),
          }}
        >
          <Button
            startIcon={<SaveOutlinedIcon />}
            sx={listeningtestStyles.draftButton}
            onClick={handlePreSaveDraft}
            disabled={isReadOnly}
          >
            Save Draft
          </Button>
          <Button
            startIcon={<SendIcon />}
            sx={listeningtestStyles.submitButton}
            onClick={handlePreSubmit}
            disabled={isReadOnly}
          >
            Submit Test
          </Button>
        </Box>
      </Box>
      {/* -------- List Part Selection --------- */}
      <Box maxWidth="lg" sx={{ ...listeningtestStyles.listPartContainer, mx: 'auto' }}>
        {/* -------- Summary Tab -------- */}
        {isReadOnly && (
          <Box
            sx={{
              ...listeningtestStyles.boxPart,
              width: 'auto',
              px: 2,
              ...(indexPart === -1 && {
                backgroundColor: 'background.default',
                borderColor: 'orange.light',
                color: 'orange.dark',
              }),
            }}
            onClick={() => handleGoToPart(-1)}
          >
            Summary
          </Box>
        )}
        {/* -------- Receptive Test Parts -------- */}
        {getVisibleTabs(indexPart, receptiveParts.length).map((item, idx) => {
          if (item === '...') {
            return (
              <Box
                key={`ellipsis-${idx}`}
                sx={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  px: 1,
                  color: 'text.gray',
                  fontWeight: 'bold',
                  fontSize: '1.2rem',
                  pb: 0.5,
                }}
              >
                ...
              </Box>
            );
          }

          const index = item;
          const part = receptiveParts[index];
          const { status, unanswered } = getListeningPartProgress(
            part,
            allAnswers,
            visitedParts,
            index,
          );

          return (
            <ListPartTab
              key={part.id}
              index={index}
              isActive={index === indexPart}
              status={status}
              unanswered={unanswered}
              onClick={() => handleGoToPart(index)}
            />
          );
        })}
      </Box>
      <Box sx={{ ...listeningtestStyles.separatorLine, backgroundColor: 'gray.main' }}></Box>
      {/* -------- Part Content Section --------- */}
      <Box sx={{ width: '100%', height: 'auto', backgroundColor: 'background.gray' }}>
        {indexPart === -1 ? (
          <SummaryTab
            staticData={staticData}
            startTime={startTime}
            allAnswers={allAnswers}
            detailAnswers={detailAnswers}
            receptiveParts={receptiveParts}
            onNavigateToQuestion={handleNavigateToQuestion}
          />
        ) : (
          receptiveParts.map((part, index) => renderPart(part, index))
        )}
      </Box>
      {/* -------- Stepper Section --------- */}
      <Box sx={{ width: '100%', height: 'auto', backgroundColor: 'background.gray', pb: 4 }}>
        <Container maxWidth="lg" sx={listeningtestStyles.stepperContainer}>
          <Typography
            sx={{
              ...listeningtestStyles.backButton,
              display:
                indexPart === -1 || (!isReadOnly && indexPart === 0)
                  ? { xs: 'none', md: 'flex' }
                  : 'flex',
              visibility:
                indexPart === -1 || (!isReadOnly && indexPart === 0) ? 'hidden' : 'visible',
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
            Prev
          </Typography>

          <Typography sx={{ fontSize: '1rem' }}>
            Section {indexPart + 1} of {receptiveParts.length}
          </Typography>

          <Box
            sx={{
              ...listeningtestStyles.summitButtonWrapper,
              // Thêm logic display: Ẩn hẳn Box wrapper này trên mobile (xs) khi ở trang cuối để chữ Section dạt ra sát mép phải
              display:
                indexPart === receptiveParts.length - 1 ? { xs: 'none', md: 'flex' } : 'flex',
            }}
          >
            {indexPart !== receptiveParts.length - 1 && (
              <Button sx={listeningtestStyles.nextButton} onClick={goNextPart}>
                Next
              </Button>
            )}
          </Box>
        </Container>
      </Box>
      {/* Khối màu xám lấp đầy khoảng trống còn lại bên dưới màn hình */}
      <Box sx={{ width: '100%', flex: 1, backgroundColor: 'background.gray' }} />
    </Box>
  );
}
