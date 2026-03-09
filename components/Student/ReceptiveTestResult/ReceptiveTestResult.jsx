'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Button,
  Chip,
  Divider,
  Stack,
  IconButton,
  Tooltip,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import TimerIcon from '@mui/icons-material/Timer';
import StarIcon from '@mui/icons-material/Star';
import { getReceptiveTestHistory } from '@/api/test';
import { getFullReceptiveTest } from '@/api/tests';

export default function ReceptiveTestResult() {
  const params = useParams();
  const historyId = params?.historyId;
  const testId = params?.testId;
  const router = useRouter();

  const [history, setHistory] = useState(null);
  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Force cleanup of any lingering scroll locks from test page or MUI modals
    const clearScrollLock = () => {
      document.body.style.overflow = 'auto'; // Force auto just in case
      document.body.style.paddingRight = '0px';
      document.body.style.userSelect = 'auto';
      document.documentElement.style.overflow = 'auto';
      document.body.removeAttribute('style'); // Clear inline styles completely if possible
    };

    clearScrollLock();
    // Clear again after a delay to ensure it outlasts any MUI Dialog exit transitions restoring old state
    const timer = setTimeout(clearScrollLock, 500);
    const timer2 = setTimeout(clearScrollLock, 1000);

    async function fetchData() {
      if (!historyId || !testId) return;
      try {
        setLoading(true);
        const token = localStorage.getItem('accessToken');
        const [historyRes, testRes] = await Promise.all([
          getReceptiveTestHistory(historyId, token),
          getFullReceptiveTest(testId, token),
        ]);
        setHistory(historyRes);
        setTestData(testRes);
      } catch (err) {
        setError('Failed to load results.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();

    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
    };
  }, [historyId, testId]);

  const { stats, maxScore } = useMemo(() => {
    if (!history || !testData) return { stats: null, maxScore: 0 };

    let totalPossible = 0;
    testData.receptive_test.receptive_parts.forEach((part) => {
      part.receptive_questions.forEach((q) => {
        totalPossible += q.score;
      });
    });

    const totalQuestions = history.answer_histories.length;
    const correctCount = history.answer_histories.filter((a) => a.is_correct).length;
    const accuracy = ((correctCount / totalQuestions) * 100).toFixed(0);
    const timeSpent = history.total_time; // in seconds
    const minutes = Math.floor(timeSpent / 60);
    const seconds = timeSpent % 60;

    return {
      stats: { totalQuestions, correctCount, accuracy, timeStr: `${minutes}m ${seconds}s` },
      maxScore: totalPossible,
    };
  }, [history, testData]);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '80vh',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <CircularProgress size={60} thickness={4} sx={{ color: '#166534' }} />
        <Typography variant="h6" color="text.secondary">
          Analyzing your results...
        </Typography>
      </Box>
    );
  }

  if (error || !history || !testData) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="h5" color="error" gutterBottom>
          {error || 'Results not found'}
        </Typography>
        <Button variant="contained" onClick={() => router.push('/student/reading')} sx={{ mt: 2 }}>
          Back to Reading Hub
        </Button>
      </Container>
    );
  }

  const skillColor = testData.skill === 'R' ? '#166534' : '#1e40af';

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', pb: 8, fontFamily: '"Outfit", sans-serif' }}>
      {/* Header / Hero Section */}
      <Box sx={{ bgcolor: '#ffffff', borderBottom: '1px solid #e2e8f0', pt: 4, pb: 6 }}>
        <Container maxWidth="lg">
          <Button
            startIcon={<ChevronLeftIcon />}
            onClick={() => router.push('/student/reading')}
            sx={{
              mb: 3,
              color: '#64748b',
              textTransform: 'none',
              fontWeight: 600,
              fontFamily: '"Outfit", sans-serif',
            }}
          >
            Back to Hub
          </Button>

          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12}>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  color: '#1e293b',
                  mb: 1,
                  letterSpacing: '-0.02em',
                  fontFamily: '"Outfit", sans-serif',
                }}
              >
                {testData.title}
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <Chip
                  label={`Level ${testData.level}`}
                  sx={{
                    fontWeight: 700,
                    bgcolor: '#f1f5f9',
                    color: '#475569',
                    borderRadius: '8px',
                    fontFamily: '"Outfit", sans-serif',
                  }}
                />
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ fontFamily: '"Outfit", sans-serif' }}
                >
                  Completed on {new Date(history.end_time).toLocaleDateString()}
                </Typography>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ mt: 6 }}>
        <Grid container spacing={4}>
          {/* Summary Cards */}
          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 4,
                borderRadius: '24px',
                position: 'sticky',
                top: 24,
                border: '1px solid #e2e8f0',
                fontFamily: '"Outfit", sans-serif',
              }}
              elevation={0}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  mb: 3,
                  color: '#1e293b',
                  fontFamily: '"Outfit", sans-serif',
                }}
              >
                Performance Analysis
              </Typography>
              <Stack spacing={3}>
                <Box>
                  <Stack direction="row" justifyContent="space-between" mb={1}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      fontWeight={600}
                      sx={{ fontFamily: '"Outfit", sans-serif' }}
                    >
                      Correct Answers
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      color="#16a34a"
                      sx={{ fontFamily: '"Outfit", sans-serif' }}
                    >
                      {stats.correctCount} / {stats.totalQuestions}
                    </Typography>
                  </Stack>
                  <Box
                    sx={{
                      width: '100%',
                      height: 8,
                      bgcolor: '#f1f5f9',
                      borderRadius: 4,
                      overflow: 'hidden',
                    }}
                  >
                    <Box sx={{ width: `${stats.accuracy}%`, height: '100%', bgcolor: '#16a34a' }} />
                  </Box>
                </Box>

                <Divider />

                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Box sx={{ p: 1, bgcolor: '#f0fdf4', borderRadius: '12px' }}>
                      <StarIcon sx={{ color: '#16a34a' }} />
                    </Box>
                    <Box>
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        sx={{ fontFamily: '"Outfit", sans-serif' }}
                      >
                        Earned Points
                      </Typography>
                      <Typography
                        variant="h6"
                        color="#16a34a"
                        fontWeight={800}
                        sx={{ fontFamily: '"Outfit", sans-serif' }}
                      >
                        +{history.total_score} EXP
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Box sx={{ p: 1, bgcolor: '#f0f9ff', borderRadius: '12px' }}>
                      <TimerIcon sx={{ color: '#0284c7' }} />
                    </Box>
                    <Box>
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        sx={{ fontFamily: '"Outfit", sans-serif' }}
                      >
                        Pace
                      </Typography>
                      <Typography
                        variant="h6"
                        fontWeight={800}
                        sx={{ fontFamily: '"Outfit", sans-serif' }}
                      >
                        {(history.total_time / stats.totalQuestions).toFixed(1)}s{' '}
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontFamily: '"Outfit", sans-serif' }}
                        >
                          / question
                        </Typography>
                      </Typography>
                    </Box>
                  </Box>
                </Stack>

                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => router.push(`/student/reading/${testId}`)}
                  sx={{
                    mt: 2,
                    py: 1.5,
                    borderRadius: '12px',
                    bgcolor: skillColor,
                    '&:hover': { bgcolor: '#14532d' },
                    textTransform: 'none',
                    fontWeight: 700,
                    fontFamily: '"Outfit", sans-serif',
                  }}
                >
                  Try Again
                </Button>
              </Stack>
            </Paper>
          </Grid>

          {/* Answer Breakdown */}
          <Grid item xs={12} md={8}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                mb: 4,
                borderRadius: '24px',
                background: `linear-gradient(135deg, ${skillColor} 0%, #14532d 100%)`,
                color: 'white',
                boxShadow:
                  '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                fontFamily: '"Outfit", sans-serif',
              }}
            >
              <Stack
                direction="row"
                divider={
                  <Divider
                    orientation="vertical"
                    flexItem
                    sx={{ borderColor: 'rgba(255,255,255,0.2)' }}
                  />
                }
                justifyContent="space-evenly"
                alignItems="center"
                textAlign="center"
              >
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="overline"
                    sx={{ opacity: 0.8, fontWeight: 700, fontFamily: '"Outfit", sans-serif' }}
                  >
                    SCORE
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: 800, fontFamily: '"Outfit", sans-serif' }}
                  >
                    {history.total_score} / {maxScore}
                  </Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="overline"
                    sx={{ opacity: 0.8, fontWeight: 700, fontFamily: '"Outfit", sans-serif' }}
                  >
                    ACCURACY
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: 800, fontFamily: '"Outfit", sans-serif' }}
                  >
                    {stats.accuracy}%
                  </Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="overline"
                    sx={{ opacity: 0.8, fontWeight: 700, fontFamily: '"Outfit", sans-serif' }}
                  >
                    TIME
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: 800, fontFamily: '"Outfit", sans-serif' }}
                  >
                    {stats.timeStr}
                  </Typography>
                </Box>
              </Stack>
            </Paper>

            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                mb: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                fontFamily: '"Outfit", sans-serif',
              }}
            >
              Answer Breakdown
              <Chip
                label={`${stats.totalQuestions} questions`}
                size="small"
                sx={{ fontWeight: 700, fontFamily: '"Outfit", sans-serif' }}
              />
            </Typography>

            <Stack spacing={3}>
              {testData.receptive_test.receptive_parts.map((part, pIdx) => (
                <Box key={part.id}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 700,
                      mb: 2,
                      color: '#64748b',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      fontFamily: '"Outfit", sans-serif',
                    }}
                  >
                    Part {part.order}: {part.description}
                  </Typography>
                  <Stack spacing={2}>
                    {part.receptive_questions.map((q) => {
                      const userAns = history.answer_histories.find(
                        (ah) => ah.question_id === q.id,
                      );
                      const isCorrect = userAns?.is_correct;
                      const correctAns = q.receptive_answers.find((a) => a.is_correct);

                      return (
                        <Paper
                          key={q.id}
                          elevation={0}
                          sx={{
                            p: 3,
                            borderRadius: '16px',
                            border: '1px solid',
                            borderColor: isCorrect ? '#dcfce7' : '#fee2e2',
                            bgcolor: isCorrect ? '#ffffff' : '#fffafb',
                            transition: 'all 0.2s',
                            fontFamily: '"Outfit", sans-serif',
                            '&:hover': { boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' },
                          }}
                        >
                          <Grid container spacing={2} alignItems="flex-start">
                            <Grid item xs={1} sx={{ display: 'flex', justifyContent: 'center' }}>
                              {isCorrect ? (
                                <CheckCircleOutlineIcon sx={{ color: '#16a34a', fontSize: 28 }} />
                              ) : (
                                <HighlightOffIcon sx={{ color: '#dc2626', fontSize: 28 }} />
                              )}
                            </Grid>
                            <Grid item xs={11}>
                              <Stack spacing={1}>
                                <Typography
                                  variant="subtitle2"
                                  sx={{
                                    fontWeight: 700,
                                    color: '#1e293b',
                                    fontFamily: '"Outfit", sans-serif',
                                  }}
                                >
                                  Question {q.question_number}
                                </Typography>
                                <Typography
                                  variant="body1"
                                  sx={{
                                    color: '#475569',
                                    mb: 1,
                                    fontFamily: '"Outfit", sans-serif',
                                  }}
                                  dangerouslySetInnerHTML={{ __html: q.content }}
                                />

                                <Grid container spacing={2}>
                                  <Grid item xs={6}>
                                    <Box
                                      sx={{
                                        p: 1.5,
                                        borderRadius: '10px',
                                        bgcolor: isCorrect ? '#f0fdf4' : '#fef2f2',
                                        border: '1px solid',
                                        borderColor: isCorrect ? '#dcfce7' : '#fecaca',
                                      }}
                                    >
                                      <Typography
                                        variant="caption"
                                        display="block"
                                        color="text.secondary"
                                        fontWeight={700}
                                        sx={{ fontFamily: '"Outfit", sans-serif' }}
                                      >
                                        YOUR ANSWER
                                      </Typography>
                                      <Typography
                                        variant="body2"
                                        fontWeight={600}
                                        color={isCorrect ? '#166534' : '#991b1b'}
                                        sx={{ fontFamily: '"Outfit", sans-serif' }}
                                      >
                                        {userAns?.selected_answer_id
                                          ? q.receptive_answers.find(
                                              (a) => a.id === userAns.selected_answer_id,
                                            )?.option_label +
                                            '. ' +
                                            (q.receptive_answers.find(
                                              (a) => a.id === userAns.selected_answer_id,
                                            )?.answer_text || '')
                                          : userAns?.user_answer_text || 'No answer'}
                                      </Typography>
                                    </Box>
                                  </Grid>
                                  {!isCorrect && (
                                    <Grid item xs={6}>
                                      <Box
                                        sx={{
                                          p: 1.5,
                                          borderRadius: '10px',
                                          bgcolor: '#f0fdf4',
                                          border: '1px solid #dcfce7',
                                        }}
                                      >
                                        <Typography
                                          variant="caption"
                                          display="block"
                                          color="text.secondary"
                                          fontWeight={700}
                                          sx={{ fontFamily: '"Outfit", sans-serif' }}
                                        >
                                          CORRECT ANSWER
                                        </Typography>
                                        <Typography
                                          variant="body2"
                                          fontWeight={600}
                                          color="#166534"
                                          sx={{ fontFamily: '"Outfit", sans-serif' }}
                                        >
                                          {correctAns
                                            ? correctAns.option_label +
                                              '. ' +
                                              (correctAns.answer_text || '')
                                            : 'N/A'}
                                        </Typography>
                                      </Box>
                                    </Grid>
                                  )}
                                </Grid>

                                {q.explanation && (
                                  <Box
                                    sx={{
                                      mt: 2,
                                      p: 2,
                                      bgcolor: '#f8fafc',
                                      borderRadius: '12px',
                                      borderLeft: '4px solid #cbd5e1',
                                    }}
                                  >
                                    <Typography
                                      variant="caption"
                                      display="block"
                                      color="text.secondary"
                                      fontWeight={700}
                                      sx={{ mb: 0.5, fontFamily: '"Outfit", sans-serif' }}
                                    >
                                      EXPLANATION
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      color="#475569"
                                      sx={{ fontFamily: '"Outfit", sans-serif' }}
                                    >
                                      {q.explanation}
                                    </Typography>
                                  </Box>
                                )}
                              </Stack>
                            </Grid>
                          </Grid>
                        </Paper>
                      );
                    })}
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
