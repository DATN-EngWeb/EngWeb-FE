/* global fetch */
/* global sessionStorage, setInterval, clearInterval */
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Typography,
  Snackbar,
  Alert,
  Backdrop,
  CircularProgress,
  Button,
  Stack,
  LinearProgress,
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
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import TimerIcon from '@mui/icons-material/Timer';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import { getProductiveTestDetails, createProductiveTest, getAIFeedback } from '@/api/test';
import ProductivePreview from '../Writing-Speaking/ProductivePreview';
import { levelTheme } from '../TestCard';
import * as styles from '../../styles/student/Writing/WritingTestStyles';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
export default function WritingTest() {
  const params = useParams();
  const testId = params.test_id;
  const attempt = params.attempt;
  const router = useRouter();

  // States
  const [text, setText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
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
  const [startTime, setStartTime] = useState(new Date().toISOString());
  const [isReadOnly, setIsReadOnly] = useState(false);
  // Word Count Logic
  const wordCount = useMemo(() => {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  }, [text]);

  const progress = useMemo(() => {
    if (!settings.minWords) return 0;
    return Math.min((wordCount / settings.minWords) * 100, 100);
  }, [wordCount, settings.minWords]);

  const formatDuration = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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
    }
  };
  const handleFinalSubmit = async () => {
    setOpenShareModal(false);
    setIsSaving(true);
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
      console.log('Submission response:', response);
      setIsDraftSaved(true);
      setIsSaving(false);
      setText('');
      setNote('');
      setSecondsElapsed(0);
      setIsFinished(false);
      setStartTime(new Date().toISOString());
      setSnackbar({ open: true, message: 'Test submitted successfully!', severity: 'success' });
      setTimeout(() => {
        sessionStorage.removeItem('current_productive_attempt');
        router.push(`/student/writing/${testId}`);
      }, 1000);
    } catch (error) {
      console.error('Submission error:', error);
      setSnackbar({ open: true, message: 'Failed to submit test', severity: 'error' });
    }
  };
  const handleAIFeedback = async () => {
    setIsSaving(true);
    setOpenShareModal(false);

    let newHistoryID = null; // Biến tạm để lưu ID vừa tạo

    try {
      // step1: submit test
      const response = await createProductiveTest({
        productive_test: testId,
        total_time: secondsElapsed,
        type: 'S',
        start_time: startTime,
        end_time: new Date().toISOString(),
        user_note_text: note,
        user_answer_text: text,
      });

      console.log('Submit Success:', response);
      newHistoryID = response.id;
      setHistoryID(newHistoryID);

      // reset form
      setIsDraftSaved(true);
      setText('');
      setNote('');
      setSecondsElapsed(0);
      setIsFinished(false);
      sessionStorage.removeItem('current_productive_attempt');

      setSnackbar({
        open: true,
        message: 'Test submitted! Fetching AI Feedback...',
        severity: 'success',
      });
    } catch (error) {
      console.error('Submission error:', error);
      setSnackbar({ open: true, message: 'Failed to submit test', severity: 'error' });
      setIsSaving(false);
      return;
    }

    // step2: get feedback
    try {
      if (!newHistoryID) throw new Error('No History ID found');
      console.log('Fetching feedback for ID:', newHistoryID);
      const category = await getAIFeedback({ id: newHistoryID });
      localStorage.setItem('category', JSON.stringify(category.ai_feedback));
      localStorage.setItem('remainAIturns', category.remaining_turns);
      console.log('Fetched AI feedback:', category);
      router.push(`/student/writing/${testId}/${attempt}/AI-feedback`);
    } catch (error) {
      console.error('Error fetching AI feedback:', error);
      setSnackbar({ open: true, message: 'Failed to get AI feedback', severity: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
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
      setIsDraftSaved(true);
      setIsSaving(false);
      setSnackbar({ open: true, message: 'Draft saved successfully!', severity: 'success' });
      setText('');
      setNote('');
      setSecondsElapsed(0);
      setStartTime(new Date().toISOString());
      setIsFinished(false);
      setTimeout(() => {
        sessionStorage.removeItem('current_productive_attempt');
        router.push(`/student/writing/${testId}`);
      }, 1000);
    } catch (error) {
      console.error('Draft save error:', error);
      setSnackbar({ open: true, message: 'Failed to save draft', severity: 'error' });
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

  return (
    <Box>
      <Box sx={styles.testHeaderContainer}>
        {/* Test title and Level */}
        <Stack direction="row" alignItems="center">
          <Box>
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
        </Stack>

        {/* time counter*/}
        <Box sx={styles.timerBox}>
          <AccessTimeIcon sx={{ fontSize: 28 }} />
          <Typography variant="inherit">
            {isMounted ? formatDuration(secondsElapsed) : '00:00'}
          </Typography>
        </Box>
      </Box>

      <Box sx={styles.mainContainer}>
        <Box sx={styles.contentWrapper}>
          <PanelGroup direction="horizontal" id="writing-test-layout">
            {/* test  data */}
            <Panel defaultSize={50} minSize={40}>
              <Box sx={{ height: '100%', overflowY: 'auto', pr: 1 }}>
                <ProductivePreview
                  preview={false}
                  title={testData.title}
                  description={question.description}
                  suggestion={question.suggestion}
                  audio={question.audio}
                />
              </Box>
            </Panel>

            <PanelResizeHandle id="resize-handle" style={{ width: '8px', cursor: 'col-resize' }} />

            {/* student test */}
            <Panel defaultSize={50} minSize={40}>
              <Box sx={{ height: '100%', overflowY: 'auto', pl: 1 }}>
                {/*  Outline */}
                {!showOutline && (
                  <Button
                    variant="contained"
                    onClick={() => setShowOutline(!showOutline)}
                    sx={{ ...styles.outlineButton }}
                  >
                    <>
                      <AssignmentOutlinedIcon /> Note/Outline <ExpandMore />
                    </>
                  </Button>
                )}

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
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={progress}
                      sx={{
                        flexGrow: 1,
                        height: 10,
                        borderRadius: 5,
                        bgcolor: '#eee',
                        '& .MuiLinearProgress-bar': { bgcolor: '#ffc107' },
                      }}
                    />
                    <Typography variant="body2" fontWeight={700}>
                      {wordCount} words
                      {/* {wordCount}/{settings.minWords} words */}
                    </Typography>
                  </Stack>

                  <TextField
                    multiline
                    fullWidth
                    rows={14}
                    placeholder="Enter your answer here ..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    sx={styles.textFieldStyle}
                    disabled={isFinished}
                  />
                  {!isFinished ? (
                    <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<AutoAwesomeIcon />}
                        onClick={() => handleAIFeedback('AI Feedback')}
                        sx={styles.aiButton}
                      >
                        AI Feedback
                      </Button>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<EditNoteIcon />}
                        onClick={() => handleSaveDraft('Save Draft')}
                        sx={{
                          ...styles.aiButton,
                          bgcolor: 'info.pastel',
                          '&:hover': { bgcolor: 'blue.main' },
                        }}
                      >
                        Save Draft
                      </Button>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<SendIcon />}
                        onClick={() => handleSubmit('Submit')}
                        disabled={wordCount < settings.minWords}
                        sx={styles.submitButton(wordCount < settings.minWords)}
                      >
                        Submit
                      </Button>
                    </Stack>
                  ) : (
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
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
        </Snackbar>

        <Backdrop sx={{ zIndex: 1200, color: '#fff' }} open={isSaving}>
          <CircularProgress color="inherit" />
        </Backdrop>
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
            Submit
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
              sx={{
                bgcolor: '#4e342e',
                borderRadius: '12px',
                px: 3,
                textTransform: 'none',
                '&:hover': { bgcolor: '#3e2723' },
              }}
            >
              Submit
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}
