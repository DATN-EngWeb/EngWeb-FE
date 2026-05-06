'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  Chip,
  Stack,
  useTheme,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import BarChartIcon from '@mui/icons-material/BarChart';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

const secondsToMinutesValue = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
};

function StatCard({ icon, label, value, iconColor, bgcolor, borderColor }) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        width: '100%',
        p: 3,
        borderRadius: '1rem',
        bgcolor: bgcolor,
        border: `1px solid ${borderColor}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        height: '100%',
      }}
    >
      <Box
        sx={{
          mb: 1.5,
          p: 1.5,
          bgcolor: `${theme.palette.background.paper}`,
          borderRadius: '50%',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          display: 'flex',
          color: iconColor,
        }}
      >
        {icon}
      </Box>
      <Typography variant="h5" sx={{ fontWeight: 800, color: iconColor, mb: 0.5 }}>
        {value}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
        {label}
      </Typography>
    </Box>
  );
}

const ReceptiveSummaryView = ({
  testData,
  history,
  stats,
  maxScore,
  navigateToReview,
  router,
  testId,
  skillColor,
}) => {
  const theme = useTheme();

  const score = history.total_score || 0;
  const bonusExp = history.earned_bonus_point || 0;
  const feedback = history.feedback_message || 'Test Completed!';

  const totalQuestions = stats.totalQuestions || 0;
  const correctCount = stats.correctCount || 0;
  const accuracy = stats.accuracy || 0;
  const startTime = history.total_time || 0;

  const timeFormatted = startTime > 60 ? secondsToMinutesValue(startTime) : `${startTime}s`;
  const avgTimePerQuestion = totalQuestions > 0 ? Math.round(startTime / totalQuestions) : 0;

  const receptiveParts = testData.receptive_test?.receptive_parts || [];
  const detailAnswers = history.answer_histories || [];
  const accentColor = '#ea580c';

  const partsData =
    receptiveParts.map((part, index) => {
      const questions = part.receptive_questions || [];

      const qDetails = questions.map((q, qIdx) => {
        const detail = detailAnswers.find((d) => d.question_id.toString() === q.id.toString());
        return {
          id: q.id,
          num: q.question_number || qIdx + 1,
          isCorrect: detail?.is_correct || false,
          isAnswered: !!detail,
        };
      });

      const correctInPart = qDetails.filter((q) => q.isCorrect).length;

      return {
        name: `Part ${part.order || index + 1}`,
        actualIndex: index,
        correctCount: correctInPart,
        totalCount: qDetails.length,
        questions: qDetails,
      };
    }) || [];

  return (
    <Box sx={{ minHeight: '100vh', pb: 8, fontFamily: '"Outfit", sans-serif' }}>
      {/* Main Content (Similar to SummaryTab) */}
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ maxWidth: '900px', mx: 'auto' }}>
          {/* --- HERO CARD --- */}
          <Paper
            elevation={4}
            sx={{
              position: 'relative',
              overflow: 'hidden',
              borderRadius: '1rem',
              p: { xs: 2, md: 4 },
              bgcolor: theme.palette.background.default,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.5)}`,
              mb: 3,
            }}
          >
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={{ xs: 2, md: 4 }}
              alignItems={{ xs: 'center', md: 'flex-start' }}
              justifyContent="space-between"
              position="relative"
              zIndex={1}
            >
              {/* Text Section */}
              <Stack
                spacing={1}
                direction="column"
                justifyContent="center"
                alignItems={{ xs: 'center', md: 'flex-start' }}
                sx={{ textAlign: { xs: 'center', md: 'left' } }}
              >
                <Chip
                  icon={
                    <EmojiEventsIcon
                      sx={{ color: `${theme.palette.primary.main} !important`, fontSize: '1.2rem' }}
                    />
                  }
                  label="Test Completed"
                  sx={{
                    width: 'fit-content',
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                    fontWeight: 700,
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  }}
                />
                <Typography
                  sx={{
                    fontSize: { xs: '1rem', md: '1.2rem' },
                    fontWeight: 900,
                    color: 'primary.main',
                    letterSpacing: '-0.5px',
                  }}
                >
                  Message Feedback
                </Typography>
                <Typography
                  sx={{
                    color: 'primary.main',
                    fontWeight: 400,
                    fontSize: '1rem',
                    lineHeight: 1.5,
                  }}
                >
                  {feedback}
                </Typography>
              </Stack>
              {/* Score Section */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                  bgcolor: theme.palette.yellow?.main || '#ffd700',
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  p: 2,
                  borderRadius: '1rem',
                  minWidth: '200px',
                }}
              >
                <Typography
                  sx={{
                    color: alpha(theme.palette.primary.main, 0.6),
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    fontSize: '0.75rem',
                  }}
                >
                  Total Score
                </Typography>
                <Stack
                  direction="row"
                  alignItems="baseline"
                  spacing={0.5}
                  sx={{ color: theme.palette.primary.main }}
                >
                  <Typography
                    sx={{ fontSize: { xs: '2rem', md: '3rem' }, fontWeight: 900, lineHeight: 1 }}
                  >
                    {score}
                  </Typography>
                  <Typography
                    sx={{ fontSize: { xs: '1rem', md: '1.5rem' }, fontWeight: 700, opacity: 0.6 }}
                  >
                    /{maxScore}
                  </Typography>
                </Stack>
              </Box>
            </Stack>
          </Paper>

          {/* --- QUICK STATS GRID --- */}
          <Grid
            container
            spacing={2}
            sx={{
              mb: 3,
              '& .MuiGrid-item': {
                display: 'flex',
              },
            }}
          >
            <Grid size={{ xs: 6, md: 3 }}>
              <StatCard
                icon={<TrackChangesIcon sx={{ fontSize: 32 }} />}
                label="Accuracy"
                value={`${accuracy}%`}
                iconColor={theme.palette.info.main}
                bgcolor={theme.palette.info?.pastel || '#e3f2fd'}
                borderColor={theme.palette.info.light}
              />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <StatCard
                icon={<CheckCircleOutlineIcon sx={{ fontSize: 32 }} />}
                label="Correct"
                value={`${correctCount}/${totalQuestions}`}
                iconColor={theme.palette.success.main}
                bgcolor={theme.palette.success?.pastel || '#e8f5e9'}
                borderColor={theme.palette.success.light}
              />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <StatCard
                icon={<AccessTimeIcon sx={{ fontSize: 32 }} />}
                label="Time Taken"
                value={timeFormatted}
                iconColor={theme.palette.warning.dark}
                bgcolor={theme.palette.warning?.pastel || '#fff8e1'}
                borderColor={theme.palette.warning.light}
              />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <StatCard
                icon={<FlashOnIcon sx={{ fontSize: 32 }} />}
                label="Bonus XP"
                value={`+${bonusExp}`}
                iconColor={theme.palette.red?.text || '#d32f2f'}
                bgcolor={theme.palette.background.default}
                borderColor={theme.palette.orange?.light || '#ffcc80'}
              />
            </Grid>
          </Grid>

          {/* --- DETAILED BREAKDOWN CARD --- */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: '24px',
              p: { xs: 3, md: 4 },
              border: `1px solid ${theme.palette.reading?.borderLight || '#e0e0e0'}`,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box
                sx={{
                  p: 1,
                  bgcolor: theme.palette.gray?.light || '#f5f5f5',
                  borderRadius: 2,
                  display: 'flex',
                }}
              >
                <BarChartIcon sx={{ color: theme.palette.darkGrey?.light || '#757575' }} />
              </Box>
              <Typography
                sx={{
                  fontSize: { xs: '1rem', md: '1.2rem' },
                  fontWeight: 700,
                  color: theme.palette.text.primary,
                }}
              >
                Performance Breakdown
              </Typography>
            </Stack>

            {/* Insights */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={12}>
                <Stack
                  direction="row"
                  spacing={2}
                  sx={{
                    p: 2,
                    bgcolor: theme.palette.background.gray || '#f8f9fa',
                    borderRadius: '16px',
                    border: `1px solid`,
                    borderColor: theme.palette.gray?.main || '#e0e0e0',
                    height: '100%',
                  }}
                >
                  <Box sx={{ mt: 0.5 }}>
                    <AccessTimeIcon sx={{ color: 'info.light' }} />
                  </Box>
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: 'primary.main' }}>
                      Pacing Analysis
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: { xs: 400, md: 600 },
                        color: theme.palette.text?.gray || '#757575',
                      }}
                    >
                      You spent an average of{' '}
                      <Box component="span" sx={{ color: 'info.main' }}>
                        {avgTimePerQuestion}s
                      </Box>{' '}
                      per question.
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
            </Grid>

            <Grid container spacing={2} alignItems="flex-start">
              {partsData.map((part, idx) => (
                <Grid item xs={12} md={6} key={idx}>
                  <Accordion
                    disableGutters
                    elevation={0}
                    sx={{
                      bgcolor: theme.palette.background.gray || '#f8f9fa',
                      borderRadius: '16px !important',
                      border: `1px solid ${theme.palette.gray?.light || '#e0e0e0'}`,
                      '&:before': { display: 'none' },
                      overflow: 'hidden',
                    }}
                  >
                    <AccordionSummary
                      expandIcon={
                        <ExpandMoreIcon sx={{ fontSize: '1.8rem', color: 'text.secondary' }} />
                      }
                      sx={{
                        p: 2,
                        minHeight: 'unset',
                        '& .MuiAccordionSummary-content': { m: 0 },
                      }}
                    >
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{ width: '100%', pr: 1 }}
                      >
                        <Typography sx={{ fontWeight: 700, color: 'primary.main' }}>
                          {part.name}
                        </Typography>
                        <Box
                          sx={{
                            bgcolor: `${theme.palette.background.paper}`,
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 1.5,
                            border: `1px solid ${theme.palette.gray?.main || '#e0e0e0'}`,
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          <Typography
                            component="span"
                            sx={{
                              fontWeight: 700,
                              fontSize: '0.875rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                            }}
                          >
                            <Box
                              component="span"
                              sx={{
                                color:
                                  part.correctCount > 0
                                    ? theme.palette.success.main
                                    : theme.palette.error.main,
                              }}
                            >
                              {part.correctCount}
                            </Box>
                            <Box component="span" sx={{ color: theme.palette.text.disabled }}>
                              / {part.totalCount}
                            </Box>
                          </Typography>
                        </Box>
                      </Stack>
                    </AccordionSummary>

                    <AccordionDetails sx={{ pt: 0, px: 2, pb: 2 }}>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {part.questions.map((q, qIdx) => {
                          const isUnanswered = !q.isAnswered;

                          return (
                            <Box
                              key={qIdx}
                              onClick={() => navigateToReview(idx)}
                              sx={{
                                cursor: 'pointer',
                                transition: 'transform 0.1s',
                                '&:hover': {
                                  transform: 'scale(1.05)',
                                },
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                px: 1.25,
                                py: 0.5,
                                borderRadius: 2,
                                border: '1px solid',
                                borderColor: isUnanswered
                                  ? theme.palette.darkGrey?.light || '#e0e0e0'
                                  : q.isCorrect
                                    ? theme.palette.success.dark
                                    : theme.palette.error.dark,
                                bgcolor: isUnanswered
                                  ? theme.palette.gray?.light || '#f5f5f5'
                                  : q.isCorrect
                                    ? theme.palette.success.pastel || '#e8f5e9'
                                    : theme.palette.error.pastel || '#ffebee',
                                color: isUnanswered
                                  ? theme.palette.gray?.main || '#9e9e9e'
                                  : q.isCorrect
                                    ? theme.palette.success.main
                                    : theme.palette.error.main,
                              }}
                            >
                              <Typography sx={{ fontSize: '0.875rem', fontWeight: 700 }}>
                                Q{q.num}
                              </Typography>
                              {isUnanswered ? (
                                <RemoveCircleOutlineIcon sx={{ fontSize: 16 }} />
                              ) : q.isCorrect ? (
                                <CheckCircleIcon sx={{ fontSize: 16 }} />
                              ) : (
                                <CancelOutlinedIcon sx={{ fontSize: 16 }} />
                              )}
                            </Box>
                          );
                        })}
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default ReceptiveSummaryView;
