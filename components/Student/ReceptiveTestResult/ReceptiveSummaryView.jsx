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
  Divider,
  Stack,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import TimerIcon from '@mui/icons-material/Timer';
import StarIcon from '@mui/icons-material/Star';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import CustomAudioPlayer from '../../Test/customAudioPlayer';

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
  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', pb: 8, fontFamily: '"Outfit", sans-serif' }}>
      {/* Header / Hero Section */}
      <Box sx={{ bgcolor: '#ffffff', borderBottom: '1px solid #e2e8f0', pt: 4, pb: 6 }}>
        <Container maxWidth="lg">
          {/* Back Button */}
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
            {testData.skill === 'L' ? 'Back to Listening Hub' : 'Back to Reading Hub'}
          </Button>
          {/* Test Title */}
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
                {/* Correct Answers */}
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
                {/* Divider */}
                <Divider />
                {/* Earned Points && Pace */}
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
                        +{history.earned_bonus_point} EXP
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
                {/* Try Again Button */}
                <Button
                  variant="contained"
                  onClick={navigateToReview}
                  sx={{
                    bgcolor: skillColor,
                    borderRadius: '12px',
                    px: 3,
                    py: 1.5,
                    fontWeight: 700,
                    textTransform: 'none',
                    fontSize: '0.9rem',
                    boxShadow: 'none',
                    whiteSpace: 'nowrap',
                    '&:hover': { bgcolor: '#14532d' },
                  }}
                >
                  Review Detailed Answers
                </Button>

                <Button
                  variant="outlined"
                  onClick={() =>
                    router.push(
                      `/student/${testData.skill === 'L' ? 'listening' : 'reading'}/${testId}`,
                    )
                  }
                  sx={{
                    borderColor: '#e2e8f0',
                    color: '#64748b',
                    borderRadius: '12px',
                    px: 3,
                    py: 1.5,
                    fontWeight: 700,
                    textTransform: 'none',
                    fontSize: '0.9rem',
                    whiteSpace: 'nowrap',
                    '&:hover': { bgcolor: '#f8fafc' },
                  }}
                >
                  Try Again
                </Button>
              </Stack>
            </Paper>
          </Grid>

          {/* Answer Breakdown */}
          <Grid item xs={12} md={8}>
            {/* Score && Accuracy && Time */}
            <Paper
              elevation={0}
              sx={{
                bgcolor: '#14532d',
                color: 'white',
                p: 3,
                borderRadius: '24px',
                display: 'flex',
                justifyContent: 'space-around',
                textAlign: 'center',
                mb: 4,
              }}
            >
              <Box>
                <Typography variant="overline" sx={{ opacity: 0.8, fontWeight: 700 }}>
                  SCORE
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                  {history.total_score} / {maxScore}
                </Typography>
              </Box>
              <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
              <Box>
                <Typography variant="overline" sx={{ opacity: 0.8, fontWeight: 700 }}>
                  ACCURACY
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                  {stats.accuracy}%
                </Typography>
              </Box>
              <Divider orientation="vertical" flexItem sx={{ bgcolor: '#326b48' }} />
              <Box>
                <Typography variant="overline" sx={{ opacity: 0.8, fontWeight: 700 }}>
                  TIME
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                  {stats.timeStr}
                </Typography>
              </Box>
            </Paper>

            <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b', mb: 1 }}>
              {testData.title}
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Chip
                label={`${stats.totalQuestions} questions`}
                size="small"
                sx={{ fontWeight: 700, fontFamily: '"Outfit", sans-serif' }}
              />
            </Stack>
            {/* Part Display */}
            <Stack spacing={3} sx={{ mt: 3 }}>
              {testData.receptive_test.receptive_parts
                .sort((a, b) => a.order - b.order)
                .map((part, pIdx) => (
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
                      {part.receptive_questions.map((q, index) => {
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
                                    Question {q.question_number || index + 1}
                                  </Typography>
                                  {/* Question Content */}
                                  <Typography
                                    variant="body1"
                                    sx={{
                                      color: '#475569',
                                      mb: 1,
                                      fontFamily: '"Outfit", sans-serif',
                                    }}
                                    dangerouslySetInnerHTML={{ __html: q.content }}
                                  />
                                  {/* Audio Player */}
                                  {q.resources.audio && (
                                    <CustomAudioPlayer src={q.resources.audio} />
                                  )}
                                  {/* Answer Options */}
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
                                            ? // Xử lí đặc biệt cho format E do cấu trúc matching
                                              (part.format === 'E'
                                                ? part.receptive_questions.flatMap(
                                                    (qu) => qu.receptive_answers,
                                                  )
                                                : q.receptive_answers
                                              ).find((a) => a.id === userAns.selected_answer_id)
                                              ? (() => {
                                                  const a = (
                                                    part.format === 'E'
                                                      ? part.receptive_questions.flatMap(
                                                          (qu) => qu.receptive_answers,
                                                        )
                                                      : q.receptive_answers
                                                  ).find(
                                                    (ans) => ans.id === userAns.selected_answer_id,
                                                  );
                                                  // Xử lý đặc biệt cho format A do có hình ảnh đi kèm
                                                  if (part.format === 'A') {
                                                    const imgUrl = a.resources?.image;
                                                    return (
                                                      <span
                                                        style={{
                                                          display: 'inline-flex',
                                                          alignItems: 'flex-start',
                                                          gap: '8px',
                                                          lineHeight: '1.2',
                                                        }}
                                                      >
                                                        <span style={{ marginTop: '2px' }}>
                                                          {correctAns.option_label}.
                                                        </span>
                                                        {imgUrl && (
                                                          <img
                                                            src={imgUrl}
                                                            alt={`Correct Option ${correctAns.option_label}`}
                                                            style={{
                                                              maxWidth: '100px',
                                                              borderRadius: '4px',
                                                              objectFit: 'contain',
                                                              display: 'block',
                                                            }}
                                                          />
                                                        )}
                                                      </span>
                                                    );
                                                  }
                                                  return `${a.option_label}. ${a.answer_text || ''}`;
                                                })()
                                              : 'N/A'
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
                                              ? (() => {
                                                  const imgUrl = correctAns.resources?.image;
                                                  // Format A: Hiển thị Label + Ảnh
                                                  if (part.format === 'A') {
                                                    return (
                                                      <span
                                                        style={{
                                                          display: 'inline-flex',
                                                          alignItems: 'flex-start',
                                                          gap: '8px',
                                                          lineHeight: '1.2',
                                                        }}
                                                      >
                                                        <span style={{ marginTop: '2px' }}>
                                                          {correctAns.option_label}.
                                                        </span>

                                                        {imgUrl && (
                                                          <img
                                                            src={imgUrl}
                                                            alt={`Correct Option ${correctAns.option_label}`}
                                                            style={{
                                                              maxWidth: '100px',
                                                              borderRadius: '4px',
                                                              objectFit: 'contain',
                                                              display: 'block',
                                                            }}
                                                          />
                                                        )}
                                                      </span>
                                                    );
                                                  }
                                                  // Format D thì không hiện label, các format khác hiện "A. Text"
                                                  const label =
                                                    part.format !== 'D'
                                                      ? `${correctAns.option_label}. `
                                                      : '';
                                                  return `${label}${correctAns.answer_text || ''}`;
                                                })()
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
};

export default ReceptiveSummaryView;
