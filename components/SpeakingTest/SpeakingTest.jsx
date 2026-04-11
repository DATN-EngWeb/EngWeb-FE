/* global fetch */
/* global sessionStorage, setInterval, clearInterval */
/* global navigator, MediaRecorder, Blob, Audio */
'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Snackbar,
  Alert,
  Backdrop,
  CircularProgress,
  Button,
  Stack,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ReplayIcon from '@mui/icons-material/Replay';
import PauseIcon from '@mui/icons-material/Pause';
import { useParams, useRouter } from 'next/navigation';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import TimerIcon from '@mui/icons-material/Timer';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels';
import { getProductiveTestDetails, createProductiveTest, getSpeakingAIFeedback } from '@/api/test';
import ProductivePreview from '../Writing-Speaking/ProductivePreview';
import { levelTheme } from '../TestCard';
import * as styles from '../../styles/student/Writing/WritingTestStyles';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { uploadMediaFile } from '../../utils/uploadHelpers';

export default function SpeakingTest() {
  const params = useParams();
  const testId = params.test_id;
  const attempt = params.attempt;
  const router = useRouter();

  // States
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [testData, setTestData] = useState({ title: '', level: '' });
  const [question, setQuestion] = useState({ description: '', suggestion: '', audio: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [isMounted, setIsMounted] = useState(false);
  const [openShareModal, setOpenShareModal] = useState(false);
  const [startTime, setStartTime] = useState(new Date().toISOString());
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isDraftSaved, setIsDraftSaved] = useState(false);
  const audioRef = React.useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const playIntervalRef = useRef(null);
  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  const getAudioDuration = (url) => {
    return new Promise((resolve, reject) => {
      const audio = new Audio(url);

      audio.onloadedmetadata = () => {
        resolve(Math.floor(audio.duration));
      };

      audio.onerror = (err) => {
        reject("Can't load audio duration: " + err);
      };
    });
  };

  // Fetch Data
  useEffect(() => {
    setIsMounted(true);
    const fetchData = async () => {
      try {
        const saved = sessionStorage.getItem('current_productive_attempt');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.isReadOnly && parsed.audio) {
            setIsPlaying(false);
            setAudioBlob(parsed.audio);
            setAudioUrl(parsed.audio);
            if (parsed.audio) {
              getAudioDuration(parsed.audio).then((duration) => {
                setRecordingTime(duration);
              });
            }
            setHasRecorded(true);
            const savedTime = Number(parsed.totalTime) || 0;
            setSecondsElapsed(savedTime);
            setIsReadOnly(true);
          }
        }
        const response = await getProductiveTestDetails(testId);
        setTestData({
          title: response.title,
          level: response.level,
          type: response.productive_test.format,
          time: response.time,
        });

        // Fetch HTML content từ link Google Storage
        const desResponse = await fetch(response.productive_test.description);
        const htmlText = await desResponse.text();

        const audioUrlFromServer = response.productive_test.glue_resources?.audio;
        setQuestion({
          description: htmlText,
          suggestion: response.productive_test.glue_text,
          audio: audioUrlFromServer
            ? { url: audioUrlFromServer, file: { name: 'Audio.mp3' } }
            : null,
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Fetch error:', error);
        setSnackbar({ open: true, message: 'Failed to load test data', severity: 'error' });
      }
    };
    if (testId) fetchData();
  }, [testId]);
  useEffect(() => {
    let timer;
    if (isMounted && !isReadOnly) {
      timer = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isMounted, isReadOnly]);
  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  if (!isMounted) {
    return <Box sx={styles.mainContainer} />;
  }
  const handleFinalSubmit = async () => {
    setOpenShareModal(false);
    setIsSaving(true);
    try {
      if (!audioBlob) return null;

      const audioFile = new File([audioBlob], `recording_${testId}.webm`, {
        type: 'audio/mpeg',
        lastModified: Date.now(),
      });
      const audioUrl = audioFile ? await uploadMediaFile(audioFile, testId) : null;

      // eslint-disable-next-line no-console
      console.log('Uploading audio to URL:', audioUrl);

      const response = await createProductiveTest({
        productive_test: testId,
        total_time: secondsElapsed,
        type: 'S',
        start_time: startTime,
        end_time: new Date().toISOString(),
        audio_path: audioUrl,
        is_shared: true,
      });
      // eslint-disable-next-line no-console
      console.log('Submission response:', response);
      setIsDraftSaved(true);
      setIsSaving(false);
      setAudioBlob(null);
      setRecordingTime(0);
      setSecondsElapsed(0);
      setStartTime(new Date().toISOString());
      setSnackbar({ open: true, message: 'Test submitted successfully!', severity: 'success' });
      setTimeout(() => {
        sessionStorage.removeItem('current_productive_attempt');
        router.push(`/student/speaking/${testId}`);
      }, 1000);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Submission error:', error);
      setSnackbar({ open: true, message: 'Failed to submit test', severity: 'error' });
    }
  };

  const handleAIFeedback = async () => {
    setOpenShareModal(false);
    setIsSaving(true);
    let newHistoryID = null;

    try {
      if (!audioBlob) return null;

      const audioFile = new File([audioBlob], `recording_${testId}.webm`, {
        type: 'audio/mpeg',
        lastModified: Date.now(),
      });
      const uploadedAudioUrl = await uploadMediaFile(audioFile, testId);

      const response = await createProductiveTest({
        productive_test: testId,
        total_time: secondsElapsed,
        type: 'S',
        start_time: startTime,
        end_time: new Date().toISOString(),
        audio_path: uploadedAudioUrl,
        is_shared: true,
      });

      newHistoryID = response.id;

      localStorage.setItem(
        'aiFeedbackContext',
        JSON.stringify({
          duration: recordingTime,
          title: testData.title,
          type: testData.type,
          audio: uploadedAudioUrl,
        }),
      );

      setIsDraftSaved(true);
      setAudioBlob(null);
      setRecordingTime(0);
      setSecondsElapsed(0);
      setStartTime(new Date().toISOString());
      sessionStorage.removeItem('current_productive_attempt');

      setSnackbar({
        open: true,
        message: 'Test submitted! Fetching AI Feedback...',
        severity: 'success',
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Submission error:', error);
      setSnackbar({ open: true, message: 'Failed to submit test', severity: 'error' });
      setIsSaving(false);
      return;
    }

    try {
      if (!newHistoryID) throw new Error('No History ID found');
      const category = await getSpeakingAIFeedback({ id: newHistoryID });
      localStorage.setItem('category', JSON.stringify(category.ai_feedback));
      localStorage.setItem('remainAIturns', category.remaining_turns);
      router.push(`/student/speaking/${testId}/${attempt}/AI-feedback`);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching AI feedback:', error);
      setSnackbar({ open: true, message: 'Failed to get AI feedback', severity: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const FormatMapper = {
    G: 'Narrative Speaking Task',
    H: 'Picture Description Task',
    I: 'Social Issue Discussion',
    J: 'Reading Aloud Task',
  };
  const handleToggleRecording = async () => {
    if (!isRecording) {
      try {
        // request permission and get microphone stream
        const stream = await window.navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];

        // when audio is available
        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        // pause audio recording
        mediaRecorderRef.current.onstop = () => {
          const blob = new window.Blob(audioChunksRef.current, { type: 'audio/webm' });
          const url = URL.createObjectURL(blob);

          setAudioBlob(blob);
          setAudioUrl(url);
          setHasRecorded(true);
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);
        setHasRecorded(false);
        setRecordingTime(0);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Microphone access denied:', err);
        setSnackbar({ open: true, message: 'Cannot access microphone!', severity: 'error' });
      }
    } else {
      // stop recording
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
        // Stop all tracks to turn off the mic indicator light in the browser
        mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
        setIsRecording(false);
      }
    }
  };
  const handlePlayAudio = () => {
    if (audioUrl) {
      if (!audioUrl) {
        setSnackbar({ open: true, message: 'No recording found to play', severity: 'warning' });
        return;
      }

      // just create a new Audio object if not exists or URL has changed
      if (!audioRef.current || audioRef.current.src !== audioUrl) {
        audioRef.current = new window.Audio(audioUrl);

        // awaiting the end of audio to reset isPlaying state
        audioRef.current.onended = () => {
          setIsPlaying(false);
        };
      }

      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
        audioRef.current.onended = () => {
          setIsPlaying(false);
        };
        playIntervalRef.current = setInterval(() => {
          if (audioRef.current) {
            setRecordingTime(Math.floor(audioRef.current.currentTime));
            if (audioRef.current.ended) {
              setIsPlaying(false);
              clearInterval(playIntervalRef.current);
            }
          }
        }, 500);
      }
    } else {
      setSnackbar({ open: true, message: 'No recording found to play', severity: 'warning' });
    }
  };
  const handleReplay = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setAudioBlob(null);
    setHasRecorded(false);
    setRecordingTime(0);
    setIsPlaying(false);
  };

  return (
    <Box>
      <Box sx={styles.testHeaderContainer}>
        {/* time counter*/}
        <Box sx={{ width: 320, display: 'flex', justifyContent: 'flex-start' }}>
          <Box sx={styles.timerBox}>
            <AccessTimeIcon sx={{ fontSize: 28 }} />
            <Typography variant="inherit">
              {isMounted ? formatTime(secondsElapsed) : '00:00'}
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
                {FormatMapper[testData.type] || 'General Speaking Task'}
              </Typography>
            </Box>
            <Box sx={{ ...styles.groupIcon }}>
              <TimerIcon />
              <Typography variant="body2">{testData.time} mins</Typography>
            </Box>
          </Stack>
        </Box>

        {/* Action Buttons on the Right, visible but logic-gated */}
        <Box
          sx={{
            width: 320,
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <Button
            variant="contained"
            disabled={!hasRecorded || isRecording || isReadOnly}
            onClick={() => handleAIFeedback()}
            startIcon={<AutoAwesomeIcon />}
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
          >
            AI Feedback
          </Button>
          <Button
            variant="contained"
            disabled={!hasRecorded || isRecording || isReadOnly}
            sx={{
              ...styles.submitButton(!hasRecorded || isRecording || isReadOnly),
              py: 1,
              px: 2,
              borderRadius: '12px',
              fontSize: '0.8125rem',
              minWidth: 'auto',
              textTransform: 'none',
              fontWeight: 700,
            }}
            onClick={handleFinalSubmit}
          >
            Submit
          </Button>
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
                  audio={question.audio?.url}
                />
              </Box>
            </Panel>

            <PanelResizeHandle id="resize-handle" style={{ width: '8px', cursor: 'col-resize' }} />

            {/* student test */}
            <Panel defaultSize={50} minSize={40}>
              <Box sx={styles.speakingTestBox}>
                {/*Instruction */}
                <Box sx={{ ...styles.forumBox, mt: 1, mb: 2, fullWidth: true }}>
                  <Typography variant="body2" fontWeight={700} gutterBottom>
                    <>
                      <InfoOutlinedIcon fontSize="medium" sx={{ mr: 0.5 }} /> Instruction
                    </>
                  </Typography>
                  <Typography variant="caption" display="block">
                    You will have {testData.time} minutes to complete this speaking test. Please
                    speak clearly into the microphone. Once you start recording, the timer will
                    begin. You can stop and review your recording before submitting. Good luck!
                  </Typography>
                </Box>
                <Box
                  sx={{
                    alignItems: 'center',
                    textAlign: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {!isRecording && !hasRecorded && (
                    <Box sx={{ mb: 4 }}>
                      <Typography variant="h6" fontWeight={700} gutterBottom>
                        Ready to record
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Click the microphone to start speaking.
                      </Typography>
                    </Box>
                  )}

                  {/* case: recording */}
                  {isRecording && (
                    <Typography variant="h5" color="error" fontWeight={700} sx={{ mb: 1 }}>
                      Recording...
                    </Typography>
                  )}

                  {/* case: recorded */}
                  {hasRecorded && !isRecording && !isReadOnly && (
                    <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
                      Analysis Complete
                    </Typography>
                  )}

                  {isReadOnly && (
                    <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
                      Your submission
                    </Typography>
                  )}

                  {/* button (Micro / Stop / Play) */}
                  <Box sx={{ position: 'relative', my: 4 }}>
                    {!hasRecorded ? (
                      // case: recording or not yet recorded
                      <IconButton
                        onClick={handleToggleRecording}
                        sx={{
                          width: 80,
                          height: 80,
                          bgcolor: isRecording ? '#ff5252' : '#f44336',
                          color: 'white',
                          '&:hover': { bgcolor: '#d32f2f' },
                        }}
                      >
                        {isRecording ? (
                          <StopIcon sx={{ fontSize: 40 }} />
                        ) : (
                          <MicIcon sx={{ fontSize: 40 }} />
                        )}
                      </IconButton>
                    ) : (
                      // case: recorded
                      <Stack
                        direction="row"
                        spacing={3}
                        justifyContent="center"
                        alignItems="center"
                      >
                        {/* replay */}
                        {!isReadOnly && (
                          <IconButton
                            onClick={() => handleReplay()}
                            sx={{ border: '2px solid #ddd', width: 50, height: 50 }}
                          >
                            <ReplayIcon />
                          </IconButton>
                        )}

                        {/* play audio */}
                        <IconButton
                          onClick={handlePlayAudio}
                          sx={{
                            width: 80,
                            height: 80,
                            bgcolor: '#ffb300',
                            color: 'white',
                            '&:hover': { bgcolor: '#ffa000' },
                          }}
                        >
                          {isPlaying ? (
                            <PauseIcon sx={{ fontSize: 40 }} />
                          ) : (
                            <PlayArrowIcon sx={{ fontSize: 40 }} />
                          )}
                        </IconButton>
                      </Stack>
                    )}
                  </Box>

                  {/* timer */}
                  <Typography variant="h3" fontWeight={500} sx={{ mb: 4, fontFamily: 'monospace' }}>
                    {formatTime(recordingTime)}
                  </Typography>
                </Box>
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
              Great job! You have completed your speaking.
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
