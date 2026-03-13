'use client';
import React, { useState, useEffect, use } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Box, Container, Typography, Card, CardContent, Chip, Button, Stack } from '@mui/material';
import {
  LightbulbOutlined,
  CheckCircleOutline,
  BarChart,
  FlashOn,
  Replay,
} from '@mui/icons-material';
import * as styles from '../../styles/student/Writing/AIFeedbackStyles';
export default function AIFeedback() {
  const [categories, setCategories] = useState([]);
  const [overall, setOverall] = useState({ summary: '', next_actions: '' });
  // const [turns, setTurns] = useState({ weekly: 0, bonus: 0 });

  const params = useParams();
  const testId = params.test_id;
  const attempt = params.attempt;
  const router = useRouter();

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('category') || '{}');

    // get overall feedback if exists
    if (data.overall) {
      setOverall(data.overall);
    }
    // const responseData = JSON.parse(localStorage.getItem('remainAIturns') || '{}');
    // if (responseData.remaining_turns) {
    //   setTurns({
    //     weekly: responseData.remaining_turns.weekly_ai_turn,
    //     bonus: responseData.remaining_turns.bonus_ai_turn,
    //   });
    // }

    // convvert json to array and filter out overall and remaining turns
    const catArray = Object.entries(data)
      .filter(([key]) => key !== 'overall')
      .map(([key, value]) => ({
        title: key.replaceAll('_', ' '),
        score: value.band,
        strengths: value.strengths,
        improvements: value.improvements,
        color: value.band >= 4 ? '#2e7d32' : value.band >= 3 ? '#ed6c02' : '#d32f2f',
        bg: value.band >= 4 ? '#e8f5e9' : value.band >= 3 ? '#fff3e0' : '#ffebee',
      }));
    setCategories(catArray);
  }, []);

  const overallScore = categories.reduce((acc, cat) => acc + cat.score, 0) / categories.length || 0;

  return (
    <Box sx={styles.mainWrapper}>
      <Container maxWidth="lg">
        {/* HEADER SECTION */}
        <Box sx={styles.headerWrapper}>
          <Typography variant="h4" fontWeight="800" color="#1a202c">
            AI Feedback Result
          </Typography>

          <Stack direction="row" spacing={3} alignItems="center">
            <Box textAlign="right">
              <Typography variant="body" color="text.secondary" fontWeight="600">
                Overall score
              </Typography>
              <Typography variant="h4" fontWeight="900" color="warning.main">
                Band {overallScore.toFixed(1)}
                <Typography component="span" variant="h6" color="text.disabled">
                  {' '}
                  / 5.0
                </Typography>
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Box
          sx={{
            ...styles.summaryCard,
            display: 'flex',
            flexDirection: 'row',
            width: '100%',
            mb: 5,
          }}
        >
          {/* Overall Summary */}
          <Box sx={{ display: 'flex', width: '50%' }}>
            <Box sx={{ p: 2 }}>
              <CardContent>
                <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                  <BarChart color="warning" />
                  <Typography variant="h6" fontWeight="700">
                    Overall Summary
                  </Typography>
                </Stack>
                <Typography variant="body">{overall.summary}</Typography>
              </CardContent>
            </Box>
          </Box>

          {/* next actions*/}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              width: '50%',
            }}
          >
            <Box sx={{ p: 2 }}>
              <Card sx={styles.NextActionCard}>
                <CardContent>
                  <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                    <FlashOn sx={{ color: '#fbc02d' }} />
                    <Typography variant="h6" fontWeight="700">
                      Next Actions
                    </Typography>
                  </Stack>
                  <Stack spacing={2}>
                    {overall.next_actions
                      ?.split(/(?=\d+\.\s)/) //spilit string to array based on number list
                      .filter((text) => text.trim() !== '') // remove space
                      .map((text, i) => (
                        <Stack key={i} direction="row" spacing={1.5} alignItems="flex-start" mb={1}>
                          <CheckCircleOutline sx={{ color: '#ed6c02', fontSize: 18, mt: 0.3 }} />
                          <Typography variant="body2" color="text.primary" fontWeight="500">
                            {text.replace(/^\d+\.\s*/, '').trim()}
                          </Typography>
                        </Stack>
                      ))}
                  </Stack>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </Box>

        {/* CATEGORIES GRID */}
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 3,
          }}
        >
          {categories.map((cat, index) => (
            <Box
              key={index}
              sx={{
                width: {
                  xs: '100%',
                  sm: 'calc(50% - 12px)',
                },
                display: 'flex',
              }}
            >
              <Card sx={{ ...styles.categoryCard, width: '100%' }}>
                <CardContent>
                  <Box sx={styles.categoryHeader}>
                    <Typography variant="subtitle1" fontWeight="800">
                      {cat.title}
                    </Typography>
                    <Chip
                      label={`Band ${cat.score}`}
                      size="small"
                      sx={{ ...styles.categoryContent, bgcolor: cat.bg, color: cat.color }}
                    />
                  </Box>

                  <Stack spacing={2}>
                    <Box>
                      <Typography
                        variant="caption"
                        color="success.main"
                        fontWeight="800"
                        display="flex"
                        alignItems="center"
                        gap={0.5}
                      >
                        <CheckCircleOutline sx={{ fontSize: 14 }} /> STRENGTHS
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {' '}
                        {cat.strengths}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography
                        variant="caption"
                        color="warning.dark"
                        fontWeight="800"
                        display="flex"
                        alignItems="center"
                        gap={0.5}
                      >
                        <LightbulbOutlined sx={{ fontSize: 14 }} /> IMPROVEMENTS
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {' '}
                        {cat.improvements}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>

        {/* FOOTER ACTIONS */}
        <Box sx={styles.footerActions}>
          <Stack direction="row" spacing={1} alignItems="center" color="text.disabled">
            <Replay fontSize="small" />
            <Typography variant="body2" fontWeight="700" color="text.primary">
              {/*turns.weekly + turns.bonus*/}
              turns left this week
            </Typography>
          </Stack>

          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              sx={styles.tryAgainButton}
              onClick={() => router.push(`/student/writing/${testId}/${parseInt(attempt) + 1}`)}
            >
              Try Again
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
