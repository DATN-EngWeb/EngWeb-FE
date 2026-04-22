import React from 'react';
import { Box, Typography, Paper, Stack, Chip, useTheme, Grid } from '@mui/material';
import { alpha } from '@mui/material/styles';

// --- MUI Icons ---
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import BarChartIcon from '@mui/icons-material/BarChart';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// --- Helper Functions ---
const secondsToMinutesValue = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
};

// --- Main Component ---
export default function SummaryTab({
  staticData,
  startTime,
  allAnswers,
  detailAnswers,
  onNavigateToQuestion,
}) {
  const theme = useTheme();

  // 1. Tính toán các chỉ số chung
  const score = staticData?.total_score || 0;

  const maxScore =
    detailAnswers?.reduce((sum, ans) => {
      const qScore = Number(ans.question_score) || 0;
      return sum + qScore;
    }, 0) || 0;

  const bonusExp = staticData?.earned_bonus_points || 0;
  const feedback = staticData?.feedback_message || 'Test Completed!';

  const totalQuestions = detailAnswers?.length || 0;
  const correctCount = detailAnswers?.filter((ans) => ans.is_correct).length || 0;

  const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  const timeFormatted = startTime > 60 ? secondsToMinutesValue(startTime) : `${startTime}s`;
  const avgTimePerQuestion = totalQuestions > 0 ? Math.round(startTime / totalQuestions) : 0;

  // 2. Tính toán dữ liệu chi tiết cho từng Part
  const partsData = allAnswers
    ? Object.entries(allAnswers).map(([partId, questions], index) => {
        const qIds = Object.keys(questions);
        const qDetails = qIds
          .map((qId) => {
            const detail = detailAnswers?.find((d) => d.question_id.toString() === qId);
            return {
              id: qId,
              num: detail?.question_number || '?',
              isCorrect: detail?.is_correct || false,
            };
          })
          .sort((a, b) => (Number(a.num) || 0) - (Number(b.num) || 0));

        const correctInPart = qDetails.filter((q) => q.isCorrect).length;

        return {
          name: `Part ${index + 1}`,
          correctCount: correctInPart,
          totalCount: qDetails.length,
          questions: qDetails,
        };
      })
    : [];

  return (
    <Box sx={{ maxWidth: '900px', mx: 'auto', p: { xs: 2, md: 3 } }}>
      {/* --- HERO CARD --- */}
      <Paper
        elevation={4}
        sx={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '1rem',
          p: { xs: 2, md: 4 },
          bgcolor: theme.palette.yellow.main,
          mb: 3,
        }}
      >
        {/* Background Decorative Circles */}
        <Box
          sx={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 250,
            height: 250,
            bgcolor: 'rgba(255,255,255,0.2)',
            borderRadius: '50%',
            filter: 'blur(40px)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -80,
            left: -80,
            width: 200,
            height: 200,
            bgcolor: 'rgba(255,255,255,0.2)',
            borderRadius: '50%',
            filter: 'blur(30px)',
          }}
        />
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
              bgcolor: alpha(theme.palette.primary.main, 0.05),
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
            {bonusExp > 0 && (
              <Chip
                icon={
                  <FlashOnIcon
                    sx={{ color: `${theme.palette.yellow.main} !important`, fontSize: '1rem' }}
                  />
                }
                label={`+${bonusExp} EXP`}
                sx={{
                  bgcolor: theme.palette.primary.main,
                  color: theme.palette.yellow.main,
                  fontWeight: 700,
                  mt: 2,
                  boxShadow: 2,
                }}
              />
            )}
          </Box>
        </Stack>
      </Paper>
      {/* --- QUICK STATS GRID --- */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            icon={<TrackChangesIcon sx={{ fontSize: 32 }} />}
            label="Accuracy"
            value={`${accuracy}%`}
            iconColor={theme.palette.info.main}
            bgcolor={theme.palette.info.pastel}
            borderColor={theme.palette.info.light}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            icon={<CheckCircleOutlineIcon sx={{ fontSize: 32 }} />}
            label="Correct"
            value={`${correctCount}/${totalQuestions}`}
            iconColor={theme.palette.success.main}
            bgcolor={theme.palette.success.pastel}
            borderColor={theme.palette.success.light}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            icon={<AccessTimeIcon sx={{ fontSize: 32 }} />}
            label="Time Taken"
            value={timeFormatted}
            iconColor={theme.palette.warning.dark}
            bgcolor={theme.palette.warning.pastel}
            borderColor={theme.palette.warning.light}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            icon={<FlashOnIcon sx={{ fontSize: 32 }} />}
            label="Bonus EXP"
            value={`+${bonusExp}`}
            iconColor={theme.palette.red.text}
            bgcolor={theme.palette.background.default}
            borderColor={theme.palette.orange.light}
          />
        </Grid>
      </Grid>

      {/* --- DETAILED BREAKDOWN CARD --- */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: '24px',
          p: { xs: 3, md: 4 },
          border: `1px solid ${theme.palette.reading.borderLight}`,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box sx={{ p: 1, bgcolor: theme.palette.gray.light, borderRadius: 2, display: 'flex' }}>
            <BarChartIcon sx={{ color: theme.palette.darkGrey.light }} />
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
          <Grid size={{ xs: 12, sm: 12 }}>
            <Stack
              direction="row"
              spacing={2}
              sx={{
                p: 2,
                bgcolor: 'background.gray',
                borderRadius: '16px',
                border: `1px solid`,
                borderColor: 'gray.main',
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
                  sx={{ fontWeight: { xs: 400, md: 600 }, color: 'text.gray' }}
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
        {/* Parts Grid */}
        <Grid container spacing={2}>
          {partsData.map((part, idx) => (
            <Grid size={{ xs: 12, md: 6 }} key={idx}>
              <Box
                sx={{
                  p: 2,
                  bgcolor: theme.palette.background.gray,
                  borderRadius: '16px',
                  border: `1px solid ${theme.palette.gray.light}`,
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: 2 }}
                >
                  <Typography sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {part.name}
                  </Typography>
                  <Box
                    sx={{
                      bgcolor: 'white',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1.5,
                      border: `1px solid ${theme.palette.gray.main}`,
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    }}
                  >
                    <Typography
                      component="span"
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.875rem',
                        color:
                          part.correctCount > 0
                            ? theme.palette.success.main
                            : theme.palette.error.main,
                      }}
                    >
                      {part.correctCount}
                    </Typography>
                    <Typography
                      component="span"
                      sx={{ fontWeight: 700, fontSize: '0.875rem', color: theme.palette.text.gray }}
                    >
                      /{part.totalCount}
                    </Typography>
                  </Box>
                </Stack>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 'auto' }}>
                  {part.questions.map((q, qIdx) => (
                    <Box
                      key={qIdx}
                      onClick={() => onNavigateToQuestion(idx, q.id)}
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
                        borderColor: q.isCorrect
                          ? theme.palette.success.light
                          : theme.palette.error.light,
                        bgcolor: q.isCorrect
                          ? theme.palette.success.pastel
                          : theme.palette.error.pastel,
                        color: q.isCorrect ? theme.palette.success.dark : theme.palette.error.main,
                      }}
                    >
                      <Typography sx={{ fontSize: '0.875rem', fontWeight: 700 }}>
                        Q{q.num}
                      </Typography>
                      {q.isCorrect ? (
                        <CheckCircleIcon sx={{ fontSize: 16 }} />
                      ) : (
                        <CancelOutlinedIcon sx={{ fontSize: 16 }} />
                      )}
                    </Box>
                  ))}
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
}

function StatCard({ icon, label, value, iconColor, bgcolor, borderColor }) {
  return (
    <Box
      sx={{
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
          bgcolor: 'white',
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
      <Typography variant="body2" sx={{ fontWeight: 600, color: '#64748b' }}>
        {label}
      </Typography>
    </Box>
  );
}
