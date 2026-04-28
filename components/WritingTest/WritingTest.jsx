/* global fetch */
/* global sessionStorage, setInterval, clearInterval */
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Typography,
  Alert,
  Backdrop,
  Button,
  Stack,
  TextField,
  Collapse,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import SendIcon from '@mui/icons-material/Send';
import EditNoteIcon from '@mui/icons-material/EditNote';
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

export default function WritingTest() {
  const params = useParams();
  const testId = params.test_id;
  const attempt = params.attempt;
  const router = useRouter();
  const { user } = useAuth(null);
  const { refreshStreak } = useStreakContext();

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
  const [serverErrorOpen, setServerErrorOpen] = useState(false);
  const [isFetchingFeedback, setIsFetchingFeedback] = useState(false);
  const [remainingAITurns, setRemainingAITurns] = useState({ weekly_ai_turn: 0, bonus_ai_turn: 0 });

  const handleServerErrorClose = () => {
    setServerErrorOpen(false);
    router.push('/student/writing');
  };
  const [startTime, setStartTime] = useState(new Date().toISOString());
  const [isReadOnly, setIsReadOnly] = useState(false);
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

    if (!savedTurns) {
      return;
    }

    try {
      setRemainingAITurns(normalizeAITurns(JSON.parse(savedTurns)));
    } catch (error) {
      setRemainingAITurns(normalizeAITurns());
    }
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id || user?.role !== 'S') {
        return;
      }

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

        // Fetch HTML content từ link Google Storage
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
          if (parsed.isReadOnly) {
            setIsFinished(true);
          }
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
      if (!isReadOnly) {
        setSecondsElapsed((prev) => prev + 1);
      }
    }, 1000);

    return () => clearInterval(timerId);
  }, [isMounted, isReadOnly]);

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
  const handleFinalSubmit = async () => {
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

      // Delay to ensure the "Submitting..." spinner state is visible
      await new Promise((resolve) => setTimeout(resolve, 600));

      setBonusPoint(response?.earned_bonus_point || 0);
      setLevelData(response?.level_notice || null);
      setHistoryID(response.id);
      setSubmitMode('final');
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
    } catch (error) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      setSubmitStatus('error');
    }
  };
  const handleAIFeedback = async () => {
    setOpenShareModal(false);
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

      // eslint-disable-next-line no-console
      console.log('Submit Success:', response);
      newHistoryID = response.id;
      setHistoryID(newHistoryID);

      // Save context for AI Feedback page
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

      // reset form
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
      const response = await createProductiveTest({
        productive_test: testId,
        total_time: secondsElapsed,
        type: 'D',
        start_time: startTime,
        end_time: new Date().toISOString(),
        user_note_text: note,
        user_answer_text: text,
      });

      // Delay to ensure the "Saving draft..." spinner state is visible
      await new Promise((resolve) => setTimeout(resolve, 600));

      setIsDraftSaved(true);
      setDraftStatus('saved');
      setText('');
      setNote('');
      setSecondsElapsed(0);
      setStartTime(new Date().toISOString());
      setIsFinished(false);
    } catch (error) {
      // Delay before switching to error state
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

  const handleGlobalClose = () => {
    setSubmitStatus('idle');
    if (submitStatus === 'submitted') {
      sessionStorage.removeItem('current_productive_attempt');
      router.push(`/student/writing/${testId}`);
    }
  };

  const handleViewResultAction = () => {
    setSubmitStatus('idle');
    router.push(`/student/writing/${testId}/${attempt}/AI-feedback`);
  };

  const FormatMapper = {
    A: 'Writing an email',
    B: 'Writing an article',
    C: 'Tell a story based on picture',
    D: 'Writing an essay',
    E: 'Writing a letter',
    F: 'Writing a review',
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Box sx={styles.testHeaderContainer}>
        {/* time counter*/}
        <Box sx={{ width: 320, display: 'flex', justifyContent: 'flex-start' }}>
          <Box sx={styles.timerBox}>
            <AccessTimeIcon sx={{ fontSize: 28 }} />
            <Typography variant="inherit">
              {isMounted ? formatDuration(secondsElapsed) : '00:00'}
            </Typography>
          </Box>
        </Box>

        {/* Test title and Level */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Stack direction="row" alignItems="center">
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#4e342e' }}>
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

        {/* Action Buttons on the Right */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            alignItems: 'flex-end',
          }}
        >
          {/* Row 1: Save Draft and Submit Test */}
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Button
              variant="contained"
              startIcon={<EditNoteIcon />}
              onClick={handleSaveDraft}
              sx={{
                ...styles.aiButton,
                bgcolor: 'info.pastel',
                color: 'info.main',
                py: 1,
                px: 2,
                borderRadius: '12px',
                fontSize: '0.8125rem',
                minWidth: 'auto',
                textTransform: 'none',
                fontWeight: 700,
                '&:hover': { bgcolor: '#e3f2fd' },
              }}
            >
              Save Draft
            </Button>
            <Button
              variant="contained"
              startIcon={<SendIcon />}
              onClick={handleSubmit}
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
          </Stack>

          {/* Row 2: AI Feedback */}
          <Button
            variant="contained"
            fullWidth
            startIcon={<AutoAwesomeIcon />}
            onClick={() => {
              if (totalAITurns <= 0) {
                setSnackbar({
                  open: true,
                  message: 'You have exhausted your AI feedback turns.',
                  severity: 'warning',
                });
                return;
              }
              handleAIFeedback();
            }}
            title={totalAITurns <= 0 ? 'AI feedback turns exhausted' : ''}
            sx={{
              ...styles.aiButton,
              py: 1,
              px: 2,
              borderRadius: '12px',
              fontSize: '0.8125rem',
              minWidth: 'auto',
              textTransform: 'none',
              fontWeight: 700,
            }}
            disabled={wordCount < settings.minWords || totalAITurns <= 0 || isFetchingFeedback}
          >
            AI Feedback
          </Button>
        </Box>
      </Box>

      <Box sx={{ ...styles.mainContainer, flex: 1 }}>
        <Box sx={styles.contentWrapper}>
          <PanelGroup direction="horizontal" id="writing-test-layout">
            {/* test  data */}
            <Panel defaultSize={50} minSize={40}>
              <Box sx={{ height: '100%', overflowY: 'auto', mr: 2 }}>
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
              {/* Vertical Line */}
              <Box sx={{ width: '2px', height: '100%', bgcolor: '#e0e0e0' }} />
              {/* Circular Handle */}
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
                  border: '1px solid #eee',
                  zIndex: 2,
                  fontSize: 14,
                  color: 'text.secondary',
                  userSelect: 'none',
                  '&:hover': {
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  },
                }}
              >
                ⇔
              </Box>
            </PanelResizeHandle>

            {/* student test */}
            <Panel defaultSize={50} minSize={40}>
              <Box sx={{ height: '100%', overflowY: 'auto', ml: 2 }}>
                <Collapse in={showOutline}>
                  <Paper sx={styles.outlinePaper}>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      color="primary.main"
                    >
                      <Typography variant="subtitle2" fontWeight={700}>
                        Your Outline / Notes
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
                          ? 'No notes were recorded for this attempt.'
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

                {/* MAIN WRITING AREA */}
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
                      '& .MuiInputBase-root': {
                        flex: 1,
                        alignItems: 'flex-start',
                      },
                      '& .MuiInputBase-input': {
                        height: '100% !important',
                      },
                    }}
                    disabled={isFinished}
                  />
                  {isFinished && (
                    <Alert severity="success" sx={{ mt: 3, borderRadius: '12px' }}>
                      This test has been submitted for grading. You can no longer edit the content.
                    </Alert>
                  )}
                </Paper>
              </Box>
            </Panel>
          </PanelGroup>
        </Box>

        {/* snackbar */}
        {/* <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
        </Snackbar> */}

        {/* Share to forum modal */}
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
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" display="block">
              Great job! You have completed your writing.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button
              variant="contained"
              onClick={handleFinalSubmit}
              sx={styles.submitButton(wordCount < 100)}
            >
              Submit Test
            </Button>
          </DialogActions>
        </Dialog>
        <Backdrop
          sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 999 }}
          open={isFetchingFeedback}
        >
          <AIGradingLoading />
        </Backdrop>

        {/* Regular Submit/Save Components */}
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
          onClose={handleGlobalClose}
          onViewResults={handleViewResultAction}
          onContinue={handleGlobalClose}
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
