/* global fetch */
/* global sessionStorage, setInterval, clearInterval */
'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import {
  Box,
  Typography,
  Alert,
  Backdrop,
  Button,
  Stack,
  TextField,
  Collapse,
  Drawer,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  IconButton,
} from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import ShareIcon from '@mui/icons-material/Share';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import TimerIcon from '@mui/icons-material/Timer';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import { getProductiveTestDetails, createProductiveTest, getAIFeedback } from '@/api/test';
import { getStudentProfile } from '../../api/accounts';
import ProductivePreview from '../Writing-Speaking/ProductivePreview';
import AIGradingLoading from '../Writing-Speaking/AIGradingLoading';
import SaveDraftToast from '../Writing-Speaking/SaveDraftToast';
import SubmitLoadingDialog from '../Writing-Speaking/SubmitLoadingDialog';
import { levelTheme } from '../TestCard';
import * as styles from '@/styles/Student/Writing/WritingTestStyles';
import { useAuth } from '../../hooks/useAuth';
import { useStreakContext } from '@/context/streakContext';
import useUnsavedChangesWarning from '@/hooks/useUnsavedChangesWarning';

export default function WritingTest() {
  const params = useParams();
  const testId = params.test_id;
  const attempt = params.attempt;
  const router = useRouter();
  const theme = useTheme();
  const isSmDown = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useAuth(null);
  const { refreshStreak, setGlobalRewardData, isCelebrationDismissed } = useStreakContext();
  const shareRedirectTimerRef = useRef(null);
  const [mobileHeaderOpen, setMobileHeaderOpen] = useState(false);
  const [mobilePromptOpen, setMobilePromptOpen] = useState(false);
  const [mobileSuggestionOpen, setMobileSuggestionOpen] = useState(false);

  // States
  const [text, setText] = useState('');
  const [submitStatus, setSubmitStatus] = useState('idle');
  const [submitMode, setSubmitMode] = useState('');
  const [bonusPoint, setBonusPoint] = useState(0);
  const [levelData, setLevelData] = useState(null);
  const [finalTimeStr, setFinalTimeStr] = useState('');
  const [draftStatus, setDraftStatus] = useState('idle');
  const [showOutline, setShowOutline] = useState(false);
  const [testData, setTestData] = useState({ title: '', level: '' });
  const [question, setQuestion] = useState({ description: '', suggestion: '', audio: null });
  const [settings, setSettings] = useState({ minWords: 50, maxWords: 1000 });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [openShareModal, setOpenShareModal] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isDraftSaved, setIsDraftSaved] = useState(false);
  const [note, setNote] = useState('');
  const [historyID, setHistoryID] = useState(0);
  const [pendingShareHistoryID, setPendingShareHistoryID] = useState(null);
  const [shareRedirectPending, setShareRedirectPending] = useState(false);
  const [shareCelebrationPending, setShareCelebrationPending] = useState(false);
  const [serverErrorOpen, setServerErrorOpen] = useState(false);
  const [isFetchingFeedback, setIsFetchingFeedback] = useState(false);
  const [remainingAITurns, setRemainingAITurns] = useState({ weekly_ai_turn: 0, bonus_ai_turn: 0 });

  const handleServerErrorClose = () => {
    setServerErrorOpen(false);
    router.push('/student/writing');
  };

  const [startTime, setStartTime] = useState(new Date().toISOString());
  const [isReadOnly, setIsReadOnly] = useState(false);

  useUnsavedChangesWarning(
    !isReadOnly && submitStatus !== 'submitting' && draftStatus !== 'saving',
  );

  // Word Count Logic
  const wordCount = useMemo(() => {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  }, [text]);

  const formatDuration = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const normalizeAITurns = (turns) => ({
    weekly_ai_turn: Number(turns?.weekly_ai_turn) || 0,
    bonus_ai_turn: Number(turns?.bonus_ai_turn) || 0,
  });

  const totalAITurns = remainingAITurns.weekly_ai_turn + remainingAITurns.bonus_ai_turn;

  useEffect(() => {
    const savedTurns = localStorage.getItem('remainAIturns');
    if (!savedTurns) return;
    try {
      setRemainingAITurns(normalizeAITurns(JSON.parse(savedTurns)));
    } catch (error) {
      setRemainingAITurns(normalizeAITurns());
    }
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id || user?.role !== 'S') return;
      try {
        const profile = await getStudentProfile(user.id);
        const nextTurns = normalizeAITurns(profile);
        setRemainingAITurns(nextTurns);
        localStorage.setItem('remainAIturns', JSON.stringify(nextTurns));
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to fetch student profile:', error);
      }
    };
    fetchProfile();
  }, [user]);

  // Fetch Data
  useEffect(() => {
    setIsMounted(true);
    const fetchData = async () => {
      try {
        const response = await getProductiveTestDetails(testId);
        setTestData({
          title: response.title,
          level: response.level,
          type: response.productive_test.format,
          time: response.time,
        });
        setSettings({
          minWords: response.productive_test.min_word || 50,
          maxWords: 1000,
        });

        const desResponse = await fetch(response.productive_test.description);
        const htmlText = await desResponse.text();
        setQuestion({
          description: htmlText,
          suggestion: response.productive_test.glue_text,
          audio: response.productive_test.glue_resources?.audio,
        });

        const saved = sessionStorage.getItem('current_productive_attempt');
        if (saved) {
          const parsed = JSON.parse(saved);
          setText(parsed.answer || '');
          setNote(parsed.note || '');
          const validDate = parsed.startTime ? new Date(parsed.startTime) : new Date();
          setStartTime(validDate.toISOString());
          const savedTime = Number(parsed.totalTime) || 0;
          setSecondsElapsed(savedTime);
          setIsReadOnly(parsed.isReadOnly || false);
          if (parsed.isReadOnly) setIsFinished(true);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Fetch error:', error);
        setSnackbar({ open: true, message: 'Failed to load test data', severity: 'error' });
      }
    };
    if (testId) fetchData();
  }, [testId]);

  useEffect(() => {
    if (!isMounted) return;
    const timerId = setInterval(() => {
      if (!isReadOnly) setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timerId);
  }, [isMounted, isReadOnly]);

  // Share-to-forum
  useEffect(() => {
    if (!shareRedirectPending || submitMode !== 'share' || !pendingShareHistoryID) return;

    if (shareCelebrationPending && !isCelebrationDismissed) return;

    if (shareRedirectTimerRef.current) {
      clearTimeout(shareRedirectTimerRef.current);
    }

    shareRedirectTimerRef.current = setTimeout(() => {
      setSubmitStatus('idle');
      setShareRedirectPending(false);
      setShareCelebrationPending(false);
      shareRedirectTimerRef.current = null;
      router.replace(`/student/writing/${testId}/share/${pendingShareHistoryID}`);
    }, 5000);

    return () => {
      if (shareRedirectTimerRef.current) {
        clearTimeout(shareRedirectTimerRef.current);
        shareRedirectTimerRef.current = null;
      }
    };
  }, [
    submitStatus,
    submitMode,
    pendingShareHistoryID,
    shareRedirectPending,
    shareCelebrationPending,
    isCelebrationDismissed,
    testId,
    router,
  ]);

  const handleCloseShareCongrat = () => {
    if (shareRedirectTimerRef.current) {
      clearTimeout(shareRedirectTimerRef.current);
      shareRedirectTimerRef.current = null;
    }

    setSubmitStatus('idle');
    if (pendingShareHistoryID) {
      setShareRedirectPending(false);
      setShareCelebrationPending(false);
      router.replace(`/student/writing/${testId}/share/${pendingShareHistoryID}`);
    }
  };

  if (!isMounted) {
    return <Box sx={styles.mainContainer} />;
  }

  const handleSubmit = () => {
    if (wordCount >= settings.minWords) {
      setOpenShareModal(true);
    } else {
      setSnackbar({
        open: true,
        message: `You need at least ${settings.minWords} words to submit. (Current: ${wordCount} words)`,
        severity: 'warning',
      });
    }
  };

  const handleFinalSubmit = async (mode = 'final') => {
    const actualMode = typeof mode === 'string' ? mode : 'final';
    setOpenShareModal(false);
    setSubmitStatus('submitting');
    try {
      const response = await createProductiveTest({
        productive_test: testId,
        total_time: secondsElapsed,
        type: 'S',
        start_time: startTime,
        end_time: new Date().toISOString(),
        user_note_text: note,
        user_answer_text: text,
      });

      await new Promise((resolve) => setTimeout(resolve, 600));

      setBonusPoint(response?.earned_bonus_point || 0);
      setLevelData(response?.level_notice || null);
      setHistoryID(response.id);
      setSubmitMode(actualMode);
      setFinalTimeStr(formatDuration(secondsElapsed));

      localStorage.setItem(
        'aiFeedbackContext',
        JSON.stringify({
          historyId: response.id,
          text: text,
          wordCount: wordCount,
          title: testData.title || 'Writing Task',
          type: testData.type,
          audio: null,
          duration: secondsElapsed,
        }),
      );

      // eslint-disable-next-line no-console
      console.log('Submission response:', response);

      setIsDraftSaved(true);
      setSubmitStatus('submitted');
      setText('');
      setNote('');
      setSecondsElapsed(0);
      setIsFinished(false);
      setStartTime(new Date().toISOString());
      setSnackbar({ open: true, message: 'Test submitted successfully!', severity: 'success' });

      await refreshStreak();
      if (response?.streak_reward_notice) {
        setGlobalRewardData(response.streak_reward_notice);
      } else if (
        response?.streak_notice?.current_streak === 1 &&
        response?.streak_notice?.is_first_submission_today === true
      ) {
        setGlobalRewardData(response.streak_notice);
      }

      // Dispatch event to refetch profile in Header
      if (typeof window !== 'undefined') {
        // eslint-disable-next-line no-undef
        window.dispatchEvent(new Event('profile-updated'));
      }

      return response.id;
    } catch (error) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      setSubmitStatus('error');
      throw error;
    }
  };

  const handleAIFeedback = async () => {
    setOpenShareModal(false);
    setPendingShareHistoryID(null);
    setShareRedirectPending(false);
    setShareCelebrationPending(false);
    setIsFetchingFeedback(true);
    let newHistoryID = null;

    try {
      const response = await createProductiveTest({
        productive_test: testId,
        total_time: secondsElapsed,
        type: 'S',
        start_time: startTime,
        end_time: new Date().toISOString(),
        user_note_text: note,
        user_answer_text: text,
      });

      setBonusPoint(response?.earned_bonus_point || 0);
      setLevelData(response?.level_notice || null);
      setSubmitMode('ai');
      setFinalTimeStr(formatDuration(secondsElapsed));

      if (response?.streak_reward_notice) {
        setGlobalRewardData(response.streak_reward_notice);
      } else if (
        response?.streak_notice?.current_streak === 1 &&
        response?.streak_notice?.is_first_submission_today === true
      ) {
        setGlobalRewardData(response.streak_notice);
      }

      // eslint-disable-next-line no-console
      console.log('Submit Success:', response);
      newHistoryID = response.id;
      setHistoryID(newHistoryID);

      localStorage.setItem(
        'aiFeedbackContext',
        JSON.stringify({
          historyId: response.id,
          text: text,
          wordCount: wordCount,
          title: testData.title || 'Writing Task',
          type: testData.type,
          audio: null,
          duration: secondsElapsed,
        }),
      );

      setIsDraftSaved(true);
      setText('');
      setNote('');
      setSecondsElapsed(0);
      setIsFinished(false);
      sessionStorage.removeItem('current_productive_attempt');
    } catch (error) {
      setIsFetchingFeedback(false);
      if (
        error?.status >= 500 ||
        error?.response?.status >= 500 ||
        error?.message?.includes('500')
      ) {
        setServerErrorOpen(true);
      } else {
        setSnackbar({ open: true, message: 'Failed to submit test', severity: 'error' });
      }
      return;
    }

    fetchAIFeedback(newHistoryID);
  };

  const fetchAIFeedback = async (idToFetch) => {
    const targetID = idToFetch || historyID;
    try {
      if (!targetID) throw new Error('No History ID found');
      setIsFetchingFeedback(true);
      // eslint-disable-next-line no-console
      console.log('Fetching feedback for ID:', targetID);
      const category = await getAIFeedback({ id: targetID });
      localStorage.setItem('category', JSON.stringify(category.ai_feedback));
      const nextTurns = normalizeAITurns(category.remaining_turns);
      setRemainingAITurns(nextTurns);
      localStorage.setItem('remainAIturns', JSON.stringify(nextTurns));
      // eslint-disable-next-line no-console
      console.log('Fetched AI feedback:', category);
      router.push(`/student/writing/${testId}/${attempt}/AI-feedback`);
    } catch (error) {
      if (
        error?.status >= 500 ||
        error?.response?.status >= 500 ||
        error?.message?.includes('500')
      ) {
        setServerErrorOpen(true);
      } else {
        setSnackbar({ open: true, message: 'Failed to get AI feedback', severity: 'error' });
      }
    } finally {
      setIsFetchingFeedback(false);
    }
  };

  const handleSaveDraft = async () => {
    setDraftStatus('saving');
    try {
      await createProductiveTest({
        productive_test: testId,
        total_time: secondsElapsed,
        type: 'D',
        start_time: startTime,
        end_time: new Date().toISOString(),
        user_note_text: note,
        user_answer_text: text,
      });

      await new Promise((resolve) => setTimeout(resolve, 600));

      setIsDraftSaved(true);
      setDraftStatus('saved');
      setText('');
      setNote('');
      setSecondsElapsed(0);
      setStartTime(new Date().toISOString());
      setIsFinished(false);
    } catch (error) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      // eslint-disable-next-line no-console
      console.error('Draft save error:', error);
      setDraftStatus('error');
    }
  };

  const handleCloseDraftToast = () => {
    if (draftStatus === 'saved') {
      sessionStorage.removeItem('current_productive_attempt');
      router.push(`/student/writing/${testId}`);
    }
    setDraftStatus('idle');
  };

  // FIX: capture current values before resetting to avoid stale closure bug
  const handleGlobalClose = (overrideShareID = null) => {
    const currentStatus = submitStatus;
    const shareID = overrideShareID ?? pendingShareHistoryID;

    setSubmitStatus('idle');

    if (currentStatus === 'submitted') {
      sessionStorage.removeItem('current_productive_attempt');
      if (shareID) {
        setPendingShareHistoryID(null);
        router.push(`/student/writing/${testId}/share/${shareID}`);
      } else {
        router.push(`/student/writing/${testId}`);
      }
    }
  };

  const handleViewResultAction = async () => {
    try {
      localStorage.removeItem('category');
      setSubmitStatus('idle');
      router.push(`/student/writing/${testId}/${attempt}/AI-feedback`);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to open submitted result:', error);
      setSnackbar({ open: true, message: 'Failed to open submitted result', severity: 'error' });
    }
  };

  const handleShareToForum = async () => {
    setOpenShareModal(false);
    setSubmitStatus('submitting');
    setSubmitMode('share');
    setShareRedirectPending(false);
    setShareCelebrationPending(false);

    try {
      const response = await createProductiveTest({
        productive_test: testId,
        total_time: secondsElapsed,
        type: 'S',
        start_time: startTime,
        end_time: new Date().toISOString(),
        user_note_text: note,
        user_answer_text: text,
      });

      const historyId = response.id;

      setBonusPoint(response?.earned_bonus_point || 0);
      setLevelData(response?.level_notice || null);
      setHistoryID(historyId);
      setPendingShareHistoryID(historyId);
      setFinalTimeStr(formatDuration(secondsElapsed));
      setShareRedirectPending(true);
      setShareCelebrationPending(
        Boolean(
          response?.streak_reward_notice ||
            (response?.streak_notice?.current_streak === 1 &&
              response?.streak_notice?.is_first_submission_today === true),
        ),
      );

      // Reset form
      setText('');
      setNote('');
      setSecondsElapsed(0);
      setIsFinished(false);
      setStartTime(new Date().toISOString());
      sessionStorage.removeItem('current_productive_attempt');
      setSubmitStatus('submitted');
      setSubmitMode('share');
      setPendingShareHistoryID(historyId);

      // Streak
      await refreshStreak();
      if (response?.streak_reward_notice) {
        setGlobalRewardData(response.streak_reward_notice);
      } else if (
        response?.streak_notice?.current_streak === 1 &&
        response?.streak_notice?.is_first_submission_today === true
      ) {
        setGlobalRewardData(response.streak_notice);
      }

      // Dispatch event to refetch profile in Header
      if (typeof window !== 'undefined') {
        // eslint-disable-next-line no-undef
        window.dispatchEvent(new Event('profile-updated'));
      }
    } catch (error) {
      console.error('Share submit error:', error);
      setSubmitStatus('error');
      setSubmitMode('');
      setShareRedirectPending(false);
      setShareCelebrationPending(false);
    }
  };
  const FormatMapper = {
    A: 'Writing an email',
    B: 'Writing an article',
    C: 'Tell a story based on picture',
    D: 'Writing an essay',
    E: 'Writing a letter',
    F: 'Writing a review',
  };
  const desktopPanelMinWidth = 420;

  return (
    <Box
      sx={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* ─── HEADER ─── */}
      <Box
        sx={{
          ...styles.testHeaderContainer,
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'stretch', md: 'center' },
          gap: { xs: 0.75, md: 0 },
          px: { xs: 1.5, md: 2 },
          py: { xs: 1, md: 2 },
        }}
      >
        {isSmDown ? (
          <>
            {/* ── Row 1: Timer + Test info toggle ── */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
              }}
            >
              {/* Timer */}
              <Box sx={{ ...styles.timerBox, fontSize: '0.95rem', gap: 0.5 }}>
                <AccessTimeIcon sx={{ fontSize: 18 }} />
                <Typography variant="inherit">
                  {isMounted ? formatDuration(secondsElapsed) : '00:00'}
                </Typography>
              </Box>

              {/* Word count pill — always visible so user doesn't lose track */}
              <Box
                sx={{
                  px: 1.5,
                  py: 0.4,
                  borderRadius: '999px',
                  bgcolor: 'rgba(0,0,0,0.05)',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: 'text.secondary',
                }}
              >
                {wordCount} words
              </Box>

              {/* Toggle test details */}
              <IconButton
                size="small"
                onClick={() => setMobileHeaderOpen((prev) => !prev)}
                aria-label={mobileHeaderOpen ? 'Hide details' : 'Show details'}
                sx={{
                  border: '1px solid rgba(0,0,0,0.10)',
                  bgcolor: 'white',
                  width: 36,
                  height: 36,
                }}
              >
                {mobileHeaderOpen ? (
                  <ExpandLess fontSize="small" />
                ) : (
                  <ExpandMore fontSize="small" />
                )}
              </IconButton>
            </Box>

            {/* ── Row 2: Action buttons (always visible, large touch targets) ── */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 1,
                width: '100%',
                mt: 0.5,
              }}
            >
              {/* Save Draft */}
              <Button
                variant="outlined"
                startIcon={<SaveOutlinedIcon sx={{ fontSize: '1.1rem !important' }} />}
                onClick={handleSaveDraft}
                sx={{
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  py: 1.25, // ~48px touch target
                }}
              >
                Save Draft
              </Button>

              {/* Submit */}
              <Button
                variant="contained"
                startIcon={<SendIcon sx={{ fontSize: '1.1rem !important' }} />}
                onClick={() => {
                  if (wordCount < settings.minWords) {
                    setSnackbar({
                      open: true,
                      message: 'You have not reached the minimum word count. Cannot submit.',
                      severity: 'warning',
                    });
                    return;
                  }
                  handleSubmit();
                }}
                disabled={wordCount < settings.minWords}
                sx={{
                  ...styles.submitButton(wordCount < settings.minWords),
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  py: 1.25,
                }}
              >
                Submit
              </Button>

              {/* AI Feedback — full width */}
              <Button
                variant="contained"
                startIcon={<AutoAwesomeIcon sx={{ fontSize: '1.1rem !important' }} />}
                onClick={() => {
                  if (totalAITurns <= 0) {
                    setSnackbar({
                      open: true,
                      message: 'You have run out of AI turns.',
                      severity: 'warning',
                    });
                    return;
                  }
                  handleAIFeedback();
                }}
                disabled={wordCount < settings.minWords || totalAITurns <= 0 || isFetchingFeedback}
                sx={{
                  ...styles.aiButton,
                  gridColumn: '1 / -1', // span full width
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  py: 1.25,
                }}
              >
                AI Feedback
                {totalAITurns > 0 && (
                  <Box
                    component="span"
                    sx={{
                      ml: 1,
                      px: 0.75,
                      py: 0.1,
                      borderRadius: '999px',
                      bgcolor: 'rgba(255,255,255,0.25)',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                    }}
                  >
                    {totalAITurns} left
                  </Box>
                )}
              </Button>
            </Box>

            {/* ── Collapsible: Test details ── */}
            <Collapse in={mobileHeaderOpen} timeout="auto" unmountOnExit sx={{ width: '100%' }}>
              <Box
                sx={{
                  mt: 0.75,
                  p: 1.5,
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.reading.instructionBorder}`,
                  bgcolor: theme.palette.reading.instructionBg,
                }}
              >
                <Typography
                  variant="subtitle2"
                  fontWeight={800}
                  sx={{ color: theme.palette.primary.main, mb: 1 }}
                >
                  {testData.title || 'Practice Test Name'}
                </Typography>
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                  <Box sx={{ ...styles.groupIcon }}>
                    <HistoryEduIcon sx={{ fontSize: 16 }} />
                    <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                      {FormatMapper[testData.type] || 'Writing an article'}
                    </Typography>
                  </Box>
                  <Box sx={{ ...styles.groupIcon }}>
                    <MenuBookIcon sx={{ fontSize: 16 }} />
                    <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                      {settings.minWords}–{settings.maxWords} words
                    </Typography>
                  </Box>
                  <Box sx={{ ...styles.groupIcon }}>
                    <TimerIcon sx={{ fontSize: 16 }} />
                    <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                      {testData.time} mins
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      px: 1.25,
                      py: 0.4,
                      borderRadius: '999px',
                      border: '1px solid',
                      borderColor: levelTheme[testData.level]?.border,
                      color: levelTheme[testData.level]?.text,
                      bgcolor: levelTheme[testData.level]?.bg,
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}
                  >
                    Level {testData.level || 'A1'}
                  </Box>
                </Stack>
              </Box>
            </Collapse>
          </>
        ) : (
          // ── DESKTOP HEADER — unchanged ──
          <>
            <Box sx={{ width: 320, display: 'flex', justifyContent: 'flex-start' }}>
              <Box sx={styles.timerBox}>
                <AccessTimeIcon sx={{ fontSize: 28 }} />
                <Typography variant="inherit">
                  {isMounted ? formatDuration(secondsElapsed) : '00:00'}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Stack direction="row" alignItems="center">
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 800, color: theme.palette.primary.main }}
                >
                  {testData.title || 'Practice Test Name'}
                </Typography>
                <Box
                  sx={{
                    px: 2,
                    py: 0.5,
                    borderRadius: '8px',
                    border: `1px solid`,
                    borderColor: levelTheme[testData.level]?.border,
                    color: levelTheme[testData.level]?.text,
                    bgcolor: levelTheme[testData.level]?.bg,
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    ml: 2,
                  }}
                >
                  Level {testData.level || 'Level A1'}
                </Box>
              </Stack>
              <Stack
                direction="row"
                spacing={3}
                alignItems="center"
                sx={{ mt: 1 }}
                divider={<Box sx={styles.divider} />}
              >
                <Box sx={{ ...styles.groupIcon }}>
                  <HistoryEduIcon />
                  <Typography variant="body2">
                    {FormatMapper[testData.type] || 'Writing an article'}
                  </Typography>
                </Box>
                <Box sx={{ ...styles.groupIcon }}>
                  <MenuBookIcon />
                  <Typography variant="body2">
                    {settings.minWords} - {settings.maxWords} words
                  </Typography>
                </Box>
                <Box sx={{ ...styles.groupIcon }}>
                  <TimerIcon />
                  <Typography variant="body2">{testData.time} mins</Typography>
                </Box>
              </Stack>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-end' }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Button
                  variant="contained"
                  startIcon={<SaveOutlinedIcon />}
                  onClick={handleSaveDraft}
                  sx={{
                    flex: 1,
                    minWidth: 0,
                    backgroundColor: 'transparent',
                    color: 'primary.main',
                    borderRadius: '12px',
                    border: '1px solid',
                    borderColor: 'gray.main',
                    fontSize: { xs: '0.8rem', md: '0.9rem' },
                    fontWeight: 700,
                    textTransform: 'none',
                    whiteSpace: 'nowrap',
                    px: 1.5,
                    py: 0.75,
                    '& .MuiButton-startIcon': {
                      marginRight: '6px',
                      marginLeft: '-4px',
                      '& svg': { fontSize: '1.2rem' },
                    },
                    '&:hover': {
                      backgroundColor: 'background.gray',
                      color: 'primary.main',
                    },
                  }}
                >
                  Save Draft
                </Button>
                <Tooltip
                  title={
                    wordCount < settings.minWords
                      ? 'You have not reached the minimum word count. Cannot submit.'
                      : 'Submit or share your test to the forum!'
                  }
                  placement="top"
                >
                  <span
                    style={{
                      display: 'inline-block',
                      cursor: wordCount < settings.minWords ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <Button
                      variant="contained"
                      startIcon={<SendIcon />}
                      onClick={() => {
                        if (wordCount < settings.minWords) {
                          setSnackbar({
                            open: true,
                            message: 'You have not reached the minimum word count. Cannot submit.',
                            severity: 'warning',
                          });
                          return;
                        }
                        handleSubmit();
                      }}
                      disabled={wordCount < settings.minWords}
                      sx={{
                        ...styles.submitButton(wordCount < settings.minWords),
                        py: 1,
                        px: 2,
                        borderRadius: '12px',
                        fontSize: '0.8125rem',
                        minWidth: 'auto',
                        textTransform: 'none',
                        fontWeight: 700,
                      }}
                    >
                      Submit Test
                    </Button>
                  </span>
                </Tooltip>
              </Stack>

              <Tooltip
                title={
                  totalAITurns <= 0
                    ? 'You have run out of AI turns.'
                    : wordCount < settings.minWords
                      ? 'You have not reached the minimum word count.'
                      : 'Get instant AI feedback! (Consumes 1 AI turn)'
                }
                placement="top"
              >
                <span
                  style={{
                    display: 'block',
                    width: '100%',
                    cursor:
                      wordCount < settings.minWords || totalAITurns <= 0
                        ? 'not-allowed'
                        : 'pointer',
                  }}
                >
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<AutoAwesomeIcon />}
                    onClick={() => {
                      if (totalAITurns <= 0) {
                        setSnackbar({
                          open: true,
                          message: 'You have run out of AI turns.',
                          severity: 'warning',
                        });
                        return;
                      }
                      handleAIFeedback();
                    }}
                    sx={{
                      ...styles.aiButton,
                      py: 1,
                      px: 2,
                      borderRadius: '12px',
                      fontSize: '0.8125rem',
                      minWidth: 'auto',
                      textTransform: 'none',
                      fontWeight: 700,
                      pointerEvents: totalAITurns <= 0 ? 'none' : 'auto',
                    }}
                    disabled={
                      wordCount < settings.minWords || totalAITurns <= 0 || isFetchingFeedback
                    }
                  >
                    AI Feedback
                  </Button>
                </span>
              </Tooltip>
            </Box>
          </>
        )}
      </Box>

      {/* ─── MAIN CONTENT ─── */}
      <Box
        sx={{
          ...styles.mainContainer,
          flex: 1,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            ...styles.contentWrapper,
            overflowY: 'auto',
            height: '100%',
          }}
        >
          {isSmDown ? (
            // ── MOBILE LAYOUT ──
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: '94%',
                gap: 1.5,
                pb: 2,
              }}
            >
              {/* Writing area first on mobile */}
              <Paper
                sx={{
                  ...styles.writingPaper,
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: 0,
                  width: '100%',
                  alignSelf: 'stretch',
                }}
              >
                {question.suggestion ? (
                  <Box sx={{ mb: 1.25 }}>
                    <Button
                      variant="text"
                      size="small"
                      onClick={() => setMobileSuggestionOpen((prev) => !prev)}
                      startIcon={mobileSuggestionOpen ? <ExpandLess /> : <ExpandMore />}
                      sx={{
                        ...styles.outlineButton,
                        alignSelf: 'flex-start',
                        textTransform: 'none',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        mb: 1,
                      }}
                    >
                      Suggestion
                    </Button>

                    <Collapse in={mobileSuggestionOpen} timeout="auto" unmountOnExit>
                      <Box
                        sx={{
                          p: 1.25,
                          borderRadius: 2,
                          border: `1px solid ${theme.palette.reading.instructionBorder}`,
                          bgcolor: theme.palette.reading.instructionBg,
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'text.secondary',
                            fontSize: '0.8rem',
                            lineHeight: 1.55,
                            whiteSpace: 'pre-wrap',
                          }}
                        >
                          {question.suggestion}
                        </Typography>
                      </Box>
                    </Collapse>
                  </Box>
                ) : null}

                {/* Outline toggle button */}
                {!showOutline && (
                  <Button
                    variant="text"
                    size="small"
                    startIcon={<AssignmentOutlinedIcon />}
                    endIcon={<ExpandMore />}
                    onClick={() => setShowOutline(true)}
                    sx={{
                      ...styles.outlineButton,
                      mb: 1,
                      alignSelf: 'flex-start',
                      textTransform: 'none',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                    }}
                  >
                    Note / Outline
                  </Button>
                )}

                {/* Outline panel — inline on mobile, no separate Collapse */}
                <Collapse in={showOutline} unmountOnExit>
                  <Box
                    sx={{
                      mb: 1.5,
                      p: 1.5,
                      borderRadius: 2,
                      border: `1px solid ${theme.palette.reading.instructionBorder}`,
                      bgcolor: theme.palette.reading.instructionBg,
                    }}
                  >
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                      <Typography variant="caption" fontWeight={700} color="primary.main">
                        Outline / Notes
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => setShowOutline(false)}
                        sx={{ p: 0.25 }}
                      >
                        <ExpandLess fontSize="small" />
                      </IconButton>
                    </Box>
                    <TextField
                      multiline
                      fullWidth
                      rows={3}
                      placeholder={
                        isFinished && !note
                          ? 'No notes were recorded for this attempt.'
                          : 'Draft your ideas here...'
                      }
                      variant="standard"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      disabled={isFinished}
                      sx={{ '& .MuiInput-underline:before': { borderColor: 'rgba(0,0,0,0.1)' } }}
                    />
                  </Box>
                </Collapse>

                {/* TextField — expands to fill all remaining space */}
                <TextField
                  multiline
                  fullWidth
                  placeholder="Enter your answer here ..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  sx={{
                    ...styles.textFieldStyle,
                    width: '100%',
                    '& .MuiInputBase-root': {
                      alignItems: 'flex-start',
                      width: '100%',
                      boxSizing: 'border-box',
                      fontSize: '0.95rem',
                      lineHeight: 1.7,
                      backgroundColor: 'white',
                      borderRadius: '12px',
                      overflow: 'hidden',
                    },
                    '& .MuiInputBase-inputMultiline': {
                      overflowY: 'auto !important',
                      resize: 'none',
                    },
                  }}
                  minRows={20}
                  maxRows={20}
                  disabled={isFinished}
                />

                {isFinished && (
                  <Alert
                    severity="success"
                    sx={{ mt: 1.5, borderRadius: '12px', fontSize: '0.82rem' }}
                  >
                    Submitted. You can no longer edit this test.
                  </Alert>
                )}
              </Paper>

              <Button
                variant="outlined"
                onClick={() => setMobilePromptOpen(true)}
                startIcon={<ExpandMore />}
                sx={{
                  alignSelf: 'flex-start',
                  textTransform: 'none',
                  fontWeight: 700,
                  borderRadius: '10px',
                }}
              >
                View test details
              </Button>

              <Drawer
                anchor="bottom"
                open={mobilePromptOpen}
                onClose={() => setMobilePromptOpen(false)}
                ModalProps={{ keepMounted: true }}
                PaperProps={{
                  sx: {
                    borderTopLeftRadius: 16,
                    borderTopRightRadius: 16,
                    maxHeight: '72vh',
                  },
                }}
              >
                <Box sx={{ p: 1.5, pb: 2, overflowY: 'auto' }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                    <Typography variant="subtitle2" fontWeight={800} color="primary.main">
                      Test details
                    </Typography>
                    <IconButton size="small" onClick={() => setMobilePromptOpen(false)}>
                      <ExpandLess fontSize="small" />
                    </IconButton>
                  </Box>
                  <ProductivePreview
                    preview={false}
                    title={testData.title}
                    description={question.description}
                    suggestion={question.suggestion}
                    audio={question.audio}
                  />
                </Box>
              </Drawer>
            </Box>
          ) : (
            // ── DESKTOP LAYOUT — unchanged ──
            <PanelGroup direction="horizontal" id="writing-test-layout">
              <Panel defaultSize={50} minSize={desktopPanelMinWidth}>
                <Box sx={{ height: '100%', overflowY: 'auto', mr: 2, minWidth: 0 }}>
                  <ProductivePreview
                    preview={false}
                    title={testData.title}
                    description={question.description}
                    suggestion={question.suggestion}
                    audio={question.audio}
                  />
                </Box>
              </Panel>

              <PanelResizeHandle
                id="resize-handle"
                style={{
                  width: '12px',
                  cursor: 'col-resize',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Box sx={{ width: '2px', height: '100%', bgcolor: theme.palette.gray.light }} />
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 28,
                    height: 28,
                    bgcolor: 'white',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 4px rgba(0,0,0,0.15)',
                    border: `1px solid ${theme.palette.gray.light}`,
                    zIndex: 2,
                    fontSize: 14,
                    color: 'text.secondary',
                    userSelect: 'none',
                    '&:hover': { boxShadow: '0 2px 8px rgba(0,0,0,0.2)' },
                  }}
                >
                  ⇔
                </Box>
              </PanelResizeHandle>

              <Panel defaultSize={50} minSize={desktopPanelMinWidth}>
                <Box sx={{ height: '100%', overflowY: 'auto', ml: 2, minWidth: 0 }}>
                  <Collapse in={showOutline}>
                    <Paper sx={styles.outlinePaper}>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        color="primary.main"
                      >
                        <Typography variant="subtitle2" fontWeight={700}>
                          Outline / Notes
                        </Typography>
                        <ExpandLess
                          fontSize="medium"
                          onClick={() => setShowOutline(false)}
                          sx={{ cursor: 'pointer', ml: 1 }}
                        />
                      </Box>
                      <TextField
                        multiline
                        fullWidth
                        rows={isFinished && !note ? 1 : 4}
                        placeholder={
                          isFinished && !note
                            ? 'No notes were recorded.'
                            : 'Draft your ideas here...'
                        }
                        variant="standard"
                        sx={{ mt: 1 }}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        disabled={isFinished}
                      />
                    </Paper>
                  </Collapse>

                  <Paper sx={styles.writingPaper}>
                    <Box
                      sx={{
                        mb: 2,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      {!showOutline ? (
                        <Button
                          variant="contained"
                          onClick={() => setShowOutline(true)}
                          sx={{ ...styles.outlineButton, mb: 0 }}
                        >
                          <AssignmentOutlinedIcon sx={{ mr: 1 }} /> Note/Outline <ExpandMore />
                        </Button>
                      ) : (
                        <Box />
                      )}
                      <Typography variant="body2" fontWeight={700}>
                        {wordCount} words
                      </Typography>
                    </Box>

                    <TextField
                      multiline
                      fullWidth
                      minRows={10}
                      placeholder="Enter your answer here ..."
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      sx={{
                        ...styles.textFieldStyle,
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        '& .MuiInputBase-root': { flex: 1, alignItems: 'flex-start' },
                        '& .MuiInputBase-input': { height: '100% !important' },
                      }}
                      disabled={isFinished}
                    />
                    {isFinished && (
                      <Alert severity="success" sx={{ mt: 3, borderRadius: '12px' }}>
                        This test has been submitted for grading. You can no longer edit the
                        content.
                      </Alert>
                    )}
                  </Paper>
                </Box>
              </Panel>
            </PanelGroup>
          )}
        </Box>

        {/* ─── DIALOGS & OVERLAYS — unchanged ─── */}
        <Dialog
          open={openShareModal}
          onClose={() => setOpenShareModal(false)}
          slotProps={{ paper: { sx: styles.forumBox } }}
        >
          <DialogTitle
            sx={{
              fontWeight: 800,
              color: 'primary.main',
              justifyContent: 'center',
              textAlign: 'center',
            }}
          >
            Submit Test
            <IconButton
              aria-label="close"
              onClick={() => setOpenShareModal(false)}
              sx={{ position: 'absolute', top: 1, right: 1, color: 'text.secondary' }}
              size="large"
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" display="block">
              Great job! You have completed your writing.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button
              variant="contained"
              onClick={handleFinalSubmit}
              sx={{
                ...styles.submitButton(wordCount < 100),
                bgcolor: 'primary.dark',
                color: 'warning.light',
                '&:hover': { bgcolor: 'warning.light', color: theme.palette.background.paper },
              }}
            >
              <SendIcon sx={{ mr: 1 }} /> Submit
            </Button>
            <Button
              variant="contained"
              onClick={handleShareToForum}
              sx={{
                ...styles.submitButton(wordCount < 100),
                bgcolor: 'warning.light',
                color: 'primary.dark',
              }}
            >
              <ShareIcon sx={{ mr: 1 }} /> Submit & Share
            </Button>
          </DialogActions>
        </Dialog>

        <Backdrop
          sx={{
            color: theme.palette.background.paper,
            zIndex: (theme) => theme.zIndex.drawer + 999,
          }}
          open={isFetchingFeedback}
        >
          <AIGradingLoading />
        </Backdrop>

        <SubmitLoadingDialog
          status={submitStatus}
          bonusPoint={bonusPoint}
          timeTaken={finalTimeStr}
          currentXP={levelData ? levelData.current_exp - bonusPoint : undefined}
          levelMaxXP={levelData ? levelData.current_level?.max_xp : undefined}
          level={levelData ? levelData.current_level?.level_number : undefined}
          levelIcon={levelData ? levelData.current_level?.level_icon : undefined}
          levelTitle={levelData ? levelData.current_level?.level_title : undefined}
          leveledUp={levelData ? levelData.leveled_up : false}
          testType="writing"
          onClose={
            submitMode === 'share'
              ? handleCloseShareCongrat
              : () => handleGlobalClose(pendingShareHistoryID)
          }
          onViewResults={
            submitMode === 'share' || pendingShareHistoryID ? undefined : handleViewResultAction
          }
          onContinue={
            submitMode === 'share'
              ? handleCloseShareCongrat
              : () => handleGlobalClose(pendingShareHistoryID)
          }
        />

        <SaveDraftToast
          status={draftStatus}
          onClose={handleCloseDraftToast}
          onRetry={handleSaveDraft}
          testType="writing"
        />

        <Dialog
          open={serverErrorOpen}
          onClose={handleServerErrorClose}
          PaperProps={{ sx: { borderRadius: 3, p: 2, minWidth: 320 } }}
        >
          <DialogTitle sx={{ fontWeight: 'bold', color: 'error.main' }}>Server Error</DialogTitle>
          <DialogContent>
            <Typography>The system is experiencing issues. Please try again later.</Typography>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleServerErrorClose}
              variant="contained"
              sx={{ bgcolor: 'error.main', '&:hover': { bgcolor: 'error.dark' } }}
            >
              OK
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}
