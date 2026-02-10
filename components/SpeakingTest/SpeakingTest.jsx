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
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels';
import { getProductiveTestDetails, createProductiveTest } from '@/api/test';
import ProductivePreview from '../Writing-Speaking/ProductivePreview';
import { levelTheme } from '../TestCard';
import * as styles from '../../styles/student/Writing/WritingTestStyles';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { uploadMediaFile } from '../../utils/uploadHelpers';

export default function WritingTest() {
  const params = useParams();
  const testId = params.test_id;
  const router = useRouter();

  // States
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [testData, setTestData] = useState({ title: '', level: '' });
  const [question, setQuestion] = useState({ description: '', suggestion: '', audio: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [isMounted, setIsMounted] = useState(false);
  const [openShareModal, setOpenShareModal] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isDraftSaved, setIsDraftSaved] = useState(false);
  const [startTime, setStartTime] = useState(new Date().toISOString());
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const audioRef = React.useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
            setHasRecorded(true);
            setIsFinished(true);
            const savedTime = Number(parsed.totalTime) || 0;
            setRecordingTime(savedTime);
            setIsReadOnly(true);
          }
        }
        const token = localStorage.getItem('accessToken');
        const response = await getProductiveTestDetails(testId, token);
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
        console.log('Fetched test data:', audioUrlFromServer);
        setQuestion({
          description: htmlText,
          suggestion: response.productive_test.glue_text,
          audio: audioUrlFromServer
            ? { url: audioUrlFromServer, file: { name: 'Audio.mp3' } }
            : null,
        });
      } catch (error) {
        console.error('Fetch error:', error);
        setSnackbar({ open: true, message: 'Failed to load test data', severity: 'error' });
      }
    };
    if (testId) fetchData();
  }, [testId]);
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
      const token = localStorage.getItem('accessToken');
      if (!audioBlob) return null;

      const audioFile = new File([audioBlob], `recording_${testId}.webm`, {
        type: 'audio/mpeg',
        lastModified: Date.now(),
      });
      const audioUrl = audioFile ? await uploadMediaFile(audioFile, testId, token) : null;

      console.log('Uploading audio to URL:', audioUrl);

      const response = await createProductiveTest(
        {
          productive_test: testId,
          total_time: recordingTime,
          type: 'S',
          start_time: startTime,
          end_time: new Date().toISOString(),
          audio_path: audioUrl,
          is_shared: true,
        },
        token,
      );
      console.log('Submission response:', response);
      setIsDraftSaved(true);
      setIsSaving(false);
      setAudioBlob(null);
      setRecordingTime(0);
      setIsFinished(false);
      setStartTime(new Date().toISOString());
      setSnackbar({ open: true, message: 'Test submitted successfully!', severity: 'success' });
      setTimeout(() => {
        sessionStorage.removeItem('current_productive_attempt');
        router.push(`/student/speaking/${testId}`);
      }, 1000);
    } catch (error) {
      console.error('Submission error:', error);
      setSnackbar({ open: true, message: 'Failed to submit test', severity: 'error' });
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
              <Box sx={{ ...styles.groupIcon, color: levelTheme[testData.level]?.text }}>
                <HistoryEduIcon />
                <Typography variant="body2">
                  {FormatMapper[testData.type] || 'General Speaking Task'}
                </Typography>
              </Box>
              <Box sx={{ ...styles.groupIcon, color: levelTheme[testData.level]?.text }}>
                <TimerIcon />
                <Typography variant="body2">{testData.time} mins</Typography>
              </Box>
            </Stack>
          </Box>
        </Stack>
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

                  {/* submit */}
                  <Button
                    variant="contained"
                    fullWidth
                    disabled={!hasRecorded || isRecording || isReadOnly}
                    sx={{
                      py: 1.5,
                      borderRadius: '12px',
                      bgcolor: 'warning.main',
                      color: 'primary.main',
                      textTransform: 'none',
                      fontWeight: 700,
                      '&.Mui-disabled': { bgcolor: '#eceff1' },
                    }}
                    onClick={handleFinalSubmit}
                  >
                    Submit test and share to the forum
                  </Button>
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
            Share to forum
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" display="block">
              Great job! You have completed your speaking. Would you like to share your work with
              the community forum?
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button
              onClick={() => setOpenShareModal(false)}
              sx={{ color: '#8d6e63', textTransform: 'none', fontWeight: 600 }}
            >
              Submit without sharing
            </Button>
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
              Confirm and Share
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}
