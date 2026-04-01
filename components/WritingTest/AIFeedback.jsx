/* global fetch */
'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Button,
  Stack,
  CircularProgress,
  Dialog,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import ReplayIcon from '@mui/icons-material/Replay';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import { Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { getProductiveTestDetails } from '@/api/test';
import ProductivePreview from '../Writing-Speaking/ProductivePreview';
import {
  Tooltip,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import * as styles from '../../styles/student/Writing/AIFeedbackStyles';

function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <Box
        sx={{
          bgcolor: 'rgba(255, 255, 255, 0.95)',
          p: 1.5,
          borderRadius: 2,
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          maxWidth: 240,
          borderLeft: `4px solid ${data.color || '#ed6c02'}`,
          backdropFilter: 'blur(4px)',
        }}
      >
        <Typography
          variant="caption"
          fontWeight="900"
          color="#3e2723"
          display="block"
          sx={{ mb: 0.5, letterSpacing: 0.5 }}
        >
          {data.title} ({data.score?.toFixed(1) || data.score})
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontSize: '0.75rem', lineHeight: 1.5, fontWeight: 500 }}
        >
          {data.score >= 4 ? data.strengths : data.improvements}
        </Typography>
      </Box>
    );
  }
  return null;
}

function CustomTick(props) {
  const { payload, x, y, cx, cy, textAnchor, categories } = props;
  const category = categories.find((c) => c.title === payload.value);
  const score = category ? category.score.toFixed(1) : '';

  let shortName = payload.value;
  if (payload.value === 'CONTENT') shortName = 'CONTENT';
  else if (payload.value === 'ORGANISATION') shortName = 'ORGANISATION';
  else if (payload.value === 'LANGUAGE') shortName = 'LANGUAGE';
  else shortName = 'COMMUNICATIVE ACHIEVEMENT';

  // Push labels radially outwards from the center evenly
  const vecX = x - cx;
  const vecY = y - cy;
  const dist = Math.sqrt(vecX * vecX + vecY * vecY) || 1;
  const pushDist = 18;

  const finalX = x + (vecX / dist) * pushDist;
  const finalY = y + (vecY / dist) * pushDist;

  // Additional Y offset if label is directly on top because the tspan adds downward height
  const topCompensation = y < cy - 20 ? -5 : 0;

  return (
    <text
      x={finalX}
      y={finalY + topCompensation}
      textAnchor={textAnchor}
      dominantBaseline="central"
    >
      <tspan x={finalX} dy="-0.5em" fill="#d32f2f" fontSize="12" fontWeight="bold">
        {shortName}
      </tspan>
      <tspan x={finalX} dy="1.2em" fill="#333" fontSize="14" fontWeight="bold">
        5.0
      </tspan>
    </text>
  );
}

export default function AIFeedback() {
  const [categories, setCategories] = useState([]);
  const [openFeedback, setOpenFeedback] = useState(true);
  const [overall, setOverall] = useState({ summary: '', next_actions: '' });
  const [context, setContext] = useState({ text: '', wordCount: 0, title: '', type: '' });
  const [testData, setTestData] = useState(null);
  // const [turns, setTurns] = useState({ weekly: 0, bonus: 0 });

  const params = useParams();
  const testId = params.test_id;
  const attempt = params.attempt;
  const router = useRouter();

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('category') || '{}');
    const ctx = JSON.parse(localStorage.getItem('aiFeedbackContext') || '{}');

    setContext(ctx);

    if (data.overall) {
      setOverall(data.overall);
    }

    const catArray = Object.entries(data)
      .filter(([key]) => key !== 'overall')
      .map(([key, value]) => ({
        title: key.replaceAll('_', ' ').toUpperCase(),
        score: value.band,
        strengths: value.strengths,
        improvements: value.improvements,
        color: value.band >= 4 ? '#2e7d32' : value.band >= 3 ? '#ed6c02' : '#d32f2f',
        bg: value.band >= 4 ? '#e8f5e9' : value.band >= 3 ? '#fff3e0' : '#ffebee',
      }));
    setCategories(catArray);
  }, []);

  useEffect(() => {
    const fetchTestData = async () => {
      if (!testId) return;
      try {
        const response = await getProductiveTestDetails(testId);
        let htmlText = '';
        if (response.productive_test?.description) {
          const desResponse = await fetch(response.productive_test.description);
          htmlText = await desResponse.text();
        }
        setTestData({
          title: response.title,
          description: htmlText,
          suggestion: response.productive_test?.glue_text,
          audio: response.productive_test?.glue_resources?.audio,
        });
      } catch (error) {
        console.error('Failed to fetch test data:', error);
      }
    };
    fetchTestData();
  }, [testId]);

  const overallScore = categories.reduce((acc, cat) => acc + cat.score, 0) / categories.length || 0;

  // Determine color for the big score ring
  const strokeColor = overallScore >= 4 ? '#2e7d32' : overallScore >= 3 ? '#ed6c02' : '#d32f2f';

  return (
    <Box sx={styles.mainWrapper}>
      <Box sx={styles.layoutContainer}>
        <Box sx={{ ...styles.gridLayout, gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' } }}>
          {/* LEFT COLUMN: Prompt Context */}
          <Box
            sx={{
              ...styles.leftColumn,
              '& .MuiPaper-root': {
                border: 'none !important',
                boxShadow: 'none !important',
                bgcolor: 'transparent !important',
                backgroundImage: 'none !important',
              },
            }}
          >
            {testData ? (
              <ProductivePreview
                preview={false}
                title={testData.title || context.title}
                description={testData.description}
                suggestion={testData.suggestion}
                audio={testData.audio}
              />
            ) : (
              <Box display="flex" justifyContent="center" alignItems="center" height={200}>
                <CircularProgress />
              </Box>
            )}
          </Box>

          {/* MIDDLE COLUMN: Student Submission */}
          <Box sx={styles.middleColumn}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="baseline"
              mb={4}
              borderBottom="1px solid #eee"
              pb={2}
            >
              <Box>
                <Typography variant="h4" fontWeight="800" color="#3e2723" mb={0.5}>
                  {context.type === 'A' ? 'Write an email' : 'Student Submission'}
                </Typography>
                <Typography
                  variant="caption"
                  fontWeight="700"
                  color="text.secondary"
                  sx={{ letterSpacing: 1 }}
                >
                  STUDENT SUBMISSION
                </Typography>
              </Box>
              <Box sx={styles.metricsDisplay}>
                <Typography
                  variant="caption"
                  fontWeight="800"
                  color="#8B5A2B"
                  sx={{ letterSpacing: 1 }}
                >
                  METRICS
                </Typography>
                <Typography variant="body1" color="text.primary">
                  {context.wordCount} words
                </Typography>
              </Box>
            </Stack>

            <Typography sx={styles.textContent}>
              {context.text || 'No submission text found.'}
            </Typography>

            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="contained"
                onClick={() => setOpenFeedback(true)}
                startIcon={<AutoAwesomeIcon sx={{ color: '#fbc02d' }} />}
                sx={{
                  bgcolor: '#4e342e',
                  '&:hover': { bgcolor: '#3e2723' },
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                  fontWeight: 'bold',
                }}
              >
                View AI Feedback
              </Button>
            </Box>
          </Box>

          {/* RIGHT COLUMN: Feedback & Score */}
          <Dialog
            open={openFeedback}
            onClose={() => setOpenFeedback(false)}
            maxWidth="md"
            fullWidth
            PaperProps={{ sx: { borderRadius: 3, overflowY: 'scroll' } }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 2,
                borderBottom: '1px solid #eee',
                bgcolor: '#F9F6F0',
              }}
            >
              <Typography variant="h6" fontWeight="bold" color="primary.main">
                AI Feedback Report
              </Typography>
              <IconButton onClick={() => setOpenFeedback(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
            <Box sx={{ ...styles.rightColumn, p: { xs: 2, md: 4 }, bgcolor: '#fafafa' }}>
              {/* OVERALL SCORE & RADAR CHART */}
              <Box
                sx={{
                  bgcolor: '#fff',
                  borderRadius: 3,
                  p: 2.5,
                  boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Box>
                  <Typography
                    variant="body2"
                    fontWeight="700"
                    color="text.secondary"
                    sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
                  >
                    Overall Score
                  </Typography>
                  <Typography
                    variant="h3"
                    fontWeight="900"
                    color="#d32f2f"
                    sx={{ lineHeight: 1, mt: 0.5 }}
                  >
                    {overallScore.toFixed(1)}
                    <Typography
                      component="span"
                      variant="h6"
                      color="text.disabled"
                      fontWeight="700"
                      sx={{ ml: 0.5 }}
                    >
                      / 5.0
                    </Typography>
                  </Typography>
                </Box>

                <Box sx={{ width: '100%', height: 240, mt: 1 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="55%" data={categories}>
                      <PolarGrid gridType="circle" stroke="#e0e0e0" radialLines={false} />
                      <PolarAngleAxis
                        dataKey="title"
                        tick={(props) => <CustomTick {...props} categories={categories} />}
                        axisLine={false}
                      />
                      <PolarRadiusAxis
                        angle={90}
                        domain={[0, 5]}
                        ticks={[1, 2, 3, 4, 5]}
                        tick={false}
                        axisLine={false}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Radar
                        name="Score"
                        dataKey="score"
                        stroke="#d32f2f"
                        fill="#d32f2f"
                        fillOpacity={0.15}
                        strokeWidth={2}
                        dot={{ r: 3, fill: '#d32f2f' }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </Box>
              </Box>

              {/* AI REVIEW DETAILS ACCORDIONS */}
              <Box sx={{ mt: 3 }}>
                {/* EDITORIAL SUMMARY */}
                <Accordion sx={styles.accordionStyle} defaultExpanded={false}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={styles.accordionSummary}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <AutoAwesomeIcon sx={{ color: '#8B5A2B', fontSize: 20 }} />
                      <Typography variant="subtitle1" fontWeight="800" color="#3e2723">
                        Editorial Summary
                      </Typography>
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails sx={styles.accordionDetails}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ lineHeight: 1.6, fontStyle: 'italic' }}
                    >
                      {overall.summary || 'Summary not available.'}
                    </Typography>
                  </AccordionDetails>
                </Accordion>

                {/* NEXT ACTIONS */}
                {overall.next_actions && (
                  <Accordion sx={styles.accordionStyle}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={styles.accordionSummary}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <FlashOnIcon sx={{ color: '#fbc02d', fontSize: 20 }} />
                        <Typography variant="subtitle1" fontWeight="800" color="#3e2723">
                          Action Plan
                        </Typography>
                      </Stack>
                    </AccordionSummary>
                    <AccordionDetails sx={styles.accordionDetails}>
                      <Stack spacing={1.5}>
                        {overall.next_actions
                          ?.split(/(?=\d+\.\s)/)
                          .filter((text) => text.trim() !== '')
                          .map((text, i) => (
                            <Stack key={i} direction="row" spacing={1} alignItems="flex-start">
                              <CheckCircleIcon sx={{ color: '#ed6c02', fontSize: 16, mt: 0.2 }} />
                              <Typography variant="caption" color="text.secondary" fontWeight="500">
                                {text.replace(/^\d+\.\s*/, '').trim()}
                              </Typography>
                            </Stack>
                          ))}
                      </Stack>
                    </AccordionDetails>
                  </Accordion>
                )}

                {/* DETAILED ASSESSMENT */}
                <Accordion sx={styles.accordionStyle} defaultExpanded={false}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={styles.accordionSummary}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <AssignmentTurnedInIcon sx={{ color: '#2e7d32', fontSize: 20 }} />
                      <Typography variant="subtitle1" fontWeight="800" color="#3e2723">
                        Detailed Assessment
                      </Typography>
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails
                    sx={{ ...styles.accordionDetails, p: 2, pb: 0, bgcolor: '#fafafa' }}
                  >
                    {categories.map((cat, index) => (
                      <Box key={index} sx={styles.feedbackCard}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography
                            variant="caption"
                            fontWeight="800"
                            sx={{ letterSpacing: 1, color: '#333' }}
                          >
                            {cat.title}
                          </Typography>
                          <Box
                            sx={{
                              bgcolor: cat.bg,
                              color: cat.color,
                              px: 1,
                              py: 0.2,
                              borderRadius: 1,
                              fontSize: '0.75rem',
                              fontWeight: 800,
                            }}
                          >
                            {cat.score.toFixed(1)}
                          </Box>
                        </Stack>
                        <Box sx={styles.feedbackIconWrapper}>
                          {cat.score >= 4 ? (
                            <CheckCircleIcon sx={{ color: cat.color, fontSize: 18, mt: 0.3 }} />
                          ) : (
                            <LightbulbIcon sx={{ color: cat.color, fontSize: 18, mt: 0.3 }} />
                          )}
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ lineHeight: 1.5 }}
                          >
                            {cat.score >= 4 ? cat.strengths : cat.improvements}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </AccordionDetails>
                </Accordion>
              </Box>

              <Box sx={{ mt: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
                  <Typography
                    variant="caption"
                    fontWeight="800"
                    color="text.secondary"
                    sx={{ letterSpacing: 1 }}
                  >
                    REMAINING TURNS
                  </Typography>
                  <Box sx={styles.dotsContainer}>
                    {[1, 2, 3].map((i) => (
                      <Box
                        key={`solid-${i}`}
                        sx={{ width: 12, height: 6, bgcolor: '#8B5A2B', borderRadius: 4 }}
                      />
                    ))}
                    {[1, 2].map((i) => (
                      <Box
                        key={`empty-${i}`}
                        sx={{ width: 12, height: 6, bgcolor: '#e0e0e0', borderRadius: 4 }}
                      />
                    ))}
                  </Box>
                </Stack>
                <Button
                  variant="contained"
                  sx={styles.tryAgainButton}
                  onClick={() => router.push(`/student/writing/${testId}/${parseInt(attempt) + 1}`)}
                  startIcon={<ReplayIcon />}
                >
                  Try Again
                </Button>
              </Box>
            </Box>
          </Dialog>
        </Box>
      </Box>
    </Box>
  );
}
