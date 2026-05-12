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
  Tooltip,
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import ShareIcon from '@mui/icons-material/Share';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ReplayIcon from '@mui/icons-material/Replay';
import PauseIcon from '@mui/icons-material/Pause';
import { useParams, useRouter } from 'next/navigation';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import TimerIcon from '@mui/icons-material/Timer';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels';
import { getProductiveTestDetails, createProductiveTest, getSpeakingAIFeedback } from '@/api/test';
import { getStudentProfile } from '../../api/accounts';
import ProductivePreview from '../Writing-Speaking/ProductivePreview';
import { levelTheme } from '../TestCard';
import * as styles from '@/styles/Student/Writing/WritingTestStyles';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SendIcon from '@mui/icons-material/Send';
import { uploadMediaFile } from '../../utils/uploadHelpers';
import CustomAudioPlayer from '../Test/customAudioPlayer';
import { useAuth } from '../../hooks/useAuth';
import { useStreakContext } from '../../context/streakContext';
import AIGradingLoading from '../Writing-Speaking/AIGradingLoading';
import SubmitLoadingDialog from '../Writing-Speaking/SubmitLoadingDialog';

export default function SpeakingTest() {
  const params = useParams();
  const testId = params.test_id;
  const attempt = params.attempt;
  const router = useRouter();
  const { user } = useAuth(null);
  const { refreshStreak, setGlobalRewardData } = useStreakContext();

  // States
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('idle');
  const [submitMode, setSubmitMode] = useState('');
  const [bonusPoint, setBonusPoint] = useState(0);
  const [levelData, setLevelData] = useState(null);
  const [finalTimeStr, setFinalTimeStr] = useState('');
  const [historyID, setHistoryID] = useState(0);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [testData, setTestData] = useState({ title: '', level: '' });
  const [question, setQuestion] = useState({ description: '', suggestion: '', audio: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [serverErrorOpen, setServerErrorOpen] = useState(false);
  const [isFetchingFeedback, setIsFetchingFeedback] = useState(false);
  const [remainingAITurns, setRemainingAITurns] = useState({ weekly_ai_turn: 0, bonus_ai_turn: 0 });

  const handleServerErrorClose = () => {
    setServerErrorOpen(false);
    router.push('/student/speaking');
  };
  const [isMounted, setIsMounted] = useState(false);
  const [openShareModal, setOpenShareModal] = useState(false);
  const [pendingShareHistoryID, setPendingShareHistoryID] = useState(null);
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
  const normalizeAITurns = (turns) => ({
    weekly_ai_turn: Number(turns?.weekly_ai_turn) || 0,
    bonus_ai_turn: Number(turns?.bonus_ai_turn) || 0,
  });
  const totalAITurns = remainingAITurns.weekly_ai_turn + remainingAITurns.bonus_ai_turn;
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

  // Share-to-forum: hiển thị SubmitDialog 5s rồi redirect sang trang share
  useEffect(() => {
    if (submitStatus !== 'submitted' || submitMode !== 'share' || !pendingShareHistoryID) return;

    const timer = setTimeout(() => {
      setSubmitStatus('idle');
      router.push(`/student/speaking/${testId}/share/${pendingShareHistoryID}`);
    }, 5000);

    return () => clearTimeout(timer);
  }, [submitStatus, submitMode, pendingShareHistoryID, testId, router]);

  if (!isMounted) {
    return <Box sx={styles.mainContainer} />;
  }
  const handleFinalSubmit = async () => {
    setOpenShareModal(false);
    setSubmitStatus('submitting');
    try {
      if (!audioBlob) {
        setSubmitStatus('idle');
        return null;
      }

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
      if (response && response.earned_bonus_point) {
        setBonusPoint(response.earned_bonus_point);
      } else {
        setBonusPoint(0);
      }
      setLevelData(response?.level_notice || null);
      setFinalTimeStr(formatTime(secondsElapsed));
      setIsDraftSaved(true);
      setSubmitMode('final');
      setSubmitStatus('submitted');
      setAudioBlob(null);
      setRecordingTime(0);
      setSecondsElapsed(0);
      setStartTime(new Date().toISOString());
      await refreshStreak();
      if (response?.streak_reward_notice) {
        setGlobalRewardData(response.streak_reward_notice);
      } else if (response?.streak_notice?.current_streak === 1) {
        setGlobalRewardData(response.streak_notice);
      }
    } catch (error) {
      if (
        error?.status >= 500 ||
        error?.response?.status >= 500 ||
        error?.message?.includes('500')
      ) {
        setServerErrorOpen(true);
      } else {
        setSubmitStatus('error');
      }
    }
  };

  const handleShareToForum = async () => {
    setOpenShareModal(false);
    setSubmitStatus('submitting');
    setSubmitMode('share');
    try {
      if (!audioBlob) {
        setSubmitStatus('idle');
        return;
      }

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

      const historyId = response.id;

      setBonusPoint(response?.earned_bonus_point || 0);
      setLevelData(response?.level_notice || null);
      setFinalTimeStr(formatTime(secondsElapsed));
      setHistoryID(historyId);
      setPendingShareHistoryID(historyId);

      // Reset
      setIsDraftSaved(true);
      setAudioBlob(null);
      setRecordingTime(0);
      setSecondsElapsed(0);
      setStartTime(new Date().toISOString());
      sessionStorage.removeItem('current_productive_attempt');

      // Set status AFTER all state ready
      setSubmitStatus('submitted');

      // Streak
      await refreshStreak();
      if (response?.streak_reward_notice) {
        setGlobalRewardData(response.streak_reward_notice);
      } else if (response?.streak_notice?.current_streak === 1) {
        setGlobalRewardData(response.streak_notice);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Share submit error:', error);
      setSubmitStatus('error');
      setSubmitMode('');
    }
  };

  const handleAIFeedback = async () => {
    setOpenShareModal(false);
    setSubmitStatus('submitting');
    let newHistoryID = null;

    try {
      if (!audioBlob) {
        setSubmitStatus('idle');
        return null;
      }

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

      if (response && response.earned_bonus_point) {
        setBonusPoint(response.earned_bonus_point);
      } else {
        setBonusPoint(0);
      }
      setLevelData(response?.level_notice || null);
      setFinalTimeStr(formatTime(secondsElapsed));
      setHistoryID(response.id);

      setIsDraftSaved(true);
      setAudioBlob(null);
      setRecordingTime(0);
      setSecondsElapsed(0);
      setStartTime(new Date().toISOString());
      sessionStorage.removeItem('current_productive_attempt');

      if (response?.streak_reward_notice) {
        setGlobalRewardData(response.streak_reward_notice);
      } else if (response?.streak_notice?.current_streak === 1) {
        setGlobalRewardData(response.streak_notice);
      }

      setSubmitMode('ai');
      setSubmitStatus('submitted');
    } catch (error) {
      if (
        error?.status >= 500 ||
        error?.response?.status >= 500 ||
        error?.message?.includes('500')
      ) {
        setServerErrorOpen(true);
      } else {
        setSubmitStatus('error');
      }
      return;
    }
  };

  const fetchAIFeedback = async () => {
    try {
      if (!historyID) throw new Error('No History ID found');
      setIsFetchingFeedback(true);
      const category = await getSpeakingAIFeedback({ id: historyID });
      localStorage.setItem('category', JSON.stringify(category.ai_feedback));
      const nextTurns = normalizeAITurns(category.remaining_turns);
      setRemainingAITurns(nextTurns);
      localStorage.setItem('remainAIturns', JSON.stringify(nextTurns));
      router.push(`/student/speaking/${testId}/${attempt}/AI-feedback`);
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

  const FormatMapper = {
    G: 'Narrative Speaking Task',
    H: 'Picture Description Task',
    I: 'Social Issue Discussion',
    J: 'Reading Aloud Task',
  };

  const handleCloseSubmitDialog = () => {
    if (submitStatus === 'submitted') {
      if (submitMode === 'final') {
        sessionStorage.removeItem('current_productive_attempt');
        router.push(`/student/speaking/${testId}`);
      } else if (submitMode === 'ai') {
        setSubmitStatus('idle');
        fetchAIFeedback();
      }
    } else {
      setSubmitStatus('idle');
    }
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
          <Tooltip
            title={
              totalAITurns <= 0 ? 'You have run out of AI turns. Cannot use this feature.' : ''
            }
            placement="top"
          >
            <span
              style={{
                cursor: totalAITurns <= 0 ? 'not-allowed' : 'pointer',
              }}
            >
              <Button
                variant="contained"
                disabled={!hasRecorded || isRecording || isReadOnly || totalAITurns <= 0}
                onClick={() => {
                  if (totalAITurns <= 0) {
                    setSnackbar({
                      open: true,
                      message: 'You have run out of AI turns. Cannot use this feature.',
                      severity: 'warning',
                    });
                    return;
                  }
                  handleAIFeedback();
                }}
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
                  pointerEvents: totalAITurns <= 0 ? 'none' : 'auto',
                }}
              >
                AI Feedback
              </Button>
            </span>
          </Tooltip>
          <Button
            variant="contained"
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
            startIcon={<SendIcon />}
            onClick={() => {
              if (isReadOnly) return;
              if (isRecording) {
                setSnackbar({
                  open: true,
                  message: 'Please stop recording before submitting.',
                  severity: 'warning',
                });
                return;
              }
              if (!hasRecorded) {
                setSnackbar({
                  open: true,
                  message: 'Please record your answer before submitting.',
                  severity: 'warning',
                });
                return;
              }
              setOpenShareModal(true);
            }}
          >
            Submit Test
          </Button>
        </Box>
      </Box>

      <Box sx={styles.mainContainer}>
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
                  audio={question.audio?.url}
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
              <Box sx={styles.speakingTestBox}>
                {/*Instruction */}
                <Box sx={{ ...styles.instructionBoxStyles, mt: 1, mb: 2 }}>
                  <Box sx={styles.instructionIconStyles}>
                    <InfoOutlinedIcon fontSize="medium" />
                  </Box>
                  <Box>
                    <Typography
                      sx={{
                        fontWeight: 600,
                        fontSize: '1rem',
                        color: 'secondary.main',
                        mb: 0.5,
                      }}
                    >
                      Instruction
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '0.9rem',
                        color: 'text.primary',
                        lineHeight: 1.5,
                      }}
                    >
                      You will have {testData.time} minutes to complete this speaking test. Please
                      speak clearly into the microphone. Once you start recording, the timer will
                      begin. You can stop and review your recording before submitting. Good luck!
                    </Typography>
                  </Box>
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
                      <Box sx={{ width: '100%', mt: 2 }}>
                        {/* replay button sitting above the bar or integrated */}
                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                          {!isReadOnly && (
                            <IconButton
                              onClick={() => handleReplay()}
                              sx={{
                                border: '1px solid #ddd',
                                p: 1,
                                color: 'text.secondary',
                                '&:hover': { bgcolor: '#f5f5f5', color: 'error.main' },
                              }}
                              title="Replay / Delete recording"
                            >
                              <ReplayIcon sx={{ fontSize: 20 }} />
                            </IconButton>
                          )}
                        </Box>

                        <CustomAudioPlayer src={audioUrl} isActive={true} />
                      </Box>
                    )}
                  </Box>

                  {/* timer - only show when recording */}
                  {!hasRecorded && (
                    <Typography
                      variant="h3"
                      fontWeight={500}
                      sx={{ mb: 4, fontFamily: 'monospace' }}
                    >
                      {formatTime(recordingTime)}
                    </Typography>
                  )}
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
          <DialogActions sx={{ p: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button
              variant="contained"
              onClick={handleFinalSubmit}
              sx={{
                bgcolor: 'primary.dark',
                color: 'warning.light',
                borderRadius: '12px',
                px: 3,
                textTransform: 'none',
                '&:hover': { bgcolor: 'warning.light', color: 'primary.dark' },
              }}
            >
              <SendIcon sx={{ mr: 1 }} />
              Submit
            </Button>
            <Button
              variant="contained"
              onClick={handleShareToForum}
              sx={{
                bgcolor: 'warning.light',
                color: 'primary.dark',
                borderRadius: '12px',
                px: 3,
                textTransform: 'none',
                '&:hover': { bgcolor: 'primary.dark', color: 'warning.light' },
              }}
            >
              <ShareIcon sx={{ mr: 1 }} />
              Submit & Share
            </Button>
          </DialogActions>
        </Dialog>
        <Backdrop
          sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 999 }}
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
          testType="speaking"
          onClose={submitMode === 'share' ? undefined : handleCloseSubmitDialog}
          onViewResults={submitMode === 'ai' ? handleCloseSubmitDialog : undefined}
          onContinue={submitMode === 'share' ? undefined : handleCloseSubmitDialog}
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
