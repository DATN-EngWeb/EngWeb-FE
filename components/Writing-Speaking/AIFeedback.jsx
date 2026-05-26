/* global fetch */
'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import {
  Box,
  Typography,
  Button,
  Tooltip as MuiTooltip,
  Stack,
  CircularProgress,
  Dialog,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Backdrop,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
} from '@mui/material';
import { LightbulbOutlined, CheckCircleOutline } from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReplayIcon from '@mui/icons-material/Replay';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import { getProductiveTestDetails, getAIFeedback, getSpeakingAIFeedback } from '@/api/test';
import { getStudentProfile } from '@/api/accounts';
import ProductivePreview from './ProductivePreview';
import {
  Tooltip as RechartsTooltip,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import DiffViewer from './DiffViewer';
import CustomAudioPlayer from '../Test/customAudioPlayer';
import AIGradingLoading from './AIGradingLoading';
import * as styles from '@/styles/Student/Writing/AIFeedbackStyles';
import { useAuth } from '../../hooks/useAuth';

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
  const score = category?.score?.toFixed(1) || '';
  let shortName = payload.value;
  if (payload.value === 'CONTENT') shortName = 'CONTENT';
  else if (payload.value === 'ORGANISATION') shortName = 'ORGANISATION';
  else if (payload.value === 'LANGUAGE') shortName = 'LANGUAGE';
  else if (payload.value === 'GRAMMAR AND VOCABULARY') shortName = 'GRAMMAR';
  else if (payload.value === 'DISCOURSE MANAGEMENT') shortName = 'DISCOURSE';
  else if (payload.value === 'PRONUNCIATION') shortName = 'PRONUNCIATION';
  else if (payload.value === 'TASK ACHIEVEMENT') shortName = 'TASK ACHIEVEMENT';
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
        {score}
      </tspan>
    </text>
  );
}

export default function AIFeedback() {
  const [categories, setCategories] = useState([]);
  const [openFeedback, setOpenFeedback] = useState(false);
  const [overall, setOverall] = useState({ summary: '', next_actions: '' });
  const [context, setContext] = useState({ text: '', wordCount: 0, title: '', type: '' });
  const [testData, setTestData] = useState(null);
  const [revised_text, setRevisedText] = useState('');
  const [isFetchingFeedback, setIsFetchingFeedback] = useState(false);
  const [turns, setTurns] = useState({ weekly_ai_turn: 0, bonus_ai_turn: 0 });
  const { user } = useAuth(null);

  const params = useParams();
  const testId = params.test_id;
  const attempt = params.attempt;
  const router = useRouter();
  const pathname = usePathname();
  const isSpeaking = pathname.includes('/speaking/');

  const [serverErrorOpen, setServerErrorOpen] = useState(false);
  const handleServerErrorClose = () => {
    setServerErrorOpen(false);
    router.push(isSpeaking ? '/student/speaking' : '/student/writing');
  };

  const formatTime = (totalSeconds) => {
    if (!totalSeconds) return '00:00';
    const mins = Math.floor(totalSeconds / 60);
    const secs = Math.floor(totalSeconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  const normalizeTurns = (value) => {
    if (typeof value === 'number') {
      return { weekly_ai_turn: value, bonus_ai_turn: 0 };
    }

    if (value && typeof value === 'object') {
      return {
        weekly_ai_turn: Number(value.weekly_ai_turn) || 0,
        bonus_ai_turn: Number(value.bonus_ai_turn) || 0,
      };
    }

    return { weekly_ai_turn: 0, bonus_ai_turn: 0 };
  };
  const totalTurns = turns.weekly_ai_turn + turns.bonus_ai_turn;

  useEffect(() => {
    setOpenFeedback(true);
  }, []);

  useEffect(() => {
    let data = {};
    let ctx = {};
    let remainAIturns = { weekly_ai_turn: 0, bonus_ai_turn: 0 };

    try {
      const rawData = localStorage.getItem('category');
      if (rawData && rawData !== '[object Object]') data = JSON.parse(rawData);
    } catch (e) {
      console.warn('Failed to parse category', e);
    }

    try {
      const rawCtx = localStorage.getItem('aiFeedbackContext');
      if (rawCtx && rawCtx !== '[object Object]') ctx = JSON.parse(rawCtx);
    } catch (e) {
      console.warn('Failed to parse aiFeedbackContext', e);
    }

    try {
      const rawTurns = localStorage.getItem('remainAIturns');
      if (rawTurns && rawTurns !== '[object Object]')
        remainAIturns = normalizeTurns(JSON.parse(rawTurns));
    } catch (e) {
      console.warn('Failed to parse remainAIturns', e);
    }

    setContext(ctx);
    setTurns(remainAIturns);
    const { revised_text, overall: overallData, ...categoriesOnly } = data;

    if (revised_text) {
      setRevisedText(revised_text);
    }
    if (overallData) {
      setOverall({
        summary: overallData.summary || '',
        next_actions: overallData.next_actions || '',
      });
    }

    const catArray = Object.entries(categoriesOnly).map(([key, value]) => {
      const score = value.band ?? 0;
      return {
        title: key.replaceAll('_', ' ').toUpperCase(),
        score: score,
        strengths: value.strengths,
        improvements: value.improvements,
        color: score >= 4 ? '#2e7d32' : score >= 3 ? '#ed6c02' : '#d32f2f',
        bg: score >= 4 ? '#e8f5e9' : score >= 3 ? '#fff3e0' : '#ffebee',
      };
    });

    setCategories(catArray);
  }, []);

  useEffect(() => {
    const fetchLatestTurns = async () => {
      if (!user?.id || user?.role !== 'S') return;

      try {
        const profile = await getStudentProfile(user.id);
        const latestTurns = normalizeTurns(profile);
        setTurns(latestTurns);
        localStorage.setItem('remainAIturns', JSON.stringify(latestTurns));
        console.log('Synced remainAIturns from profile:', latestTurns);
      } catch (error) {
        console.error('Failed to sync remainAIturns from profile:', error);
      }
    };

    fetchLatestTurns();
  }, [user]);

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
                  {categories.length > 0 && !isSpeaking ? 'AI Corrected' : 'Your Submission'}
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
                  {!isSpeaking && `${context.wordCount} words`}
                  {!isSpeaking && context.duration ? ' - ' : ''}
                  {context.duration ? formatTime(context.duration) + ' mins' : ''}
                </Typography>
              </Box>
            </Stack>

            <Box>
              {isSpeaking ? (
                <>
                  <Typography variant="body1" color="text.secondary">
                    Your speaking response has been recorded. You can play your submission below.
                  </Typography>
                  {context.audio && (
                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                      <CustomAudioPlayer src={context.audio} isActive={true} />
                    </Box>
                  )}
                </>
              ) : categories.length > 0 ? (
                <DiffViewer originalText={context.text} revisedText={revised_text} />
              ) : (
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    minHeight: '200px',
                    bgcolor: 'transparent',
                    border: '1px solid #ffd54f',
                    borderRadius: 3,
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '1rem',
                  }}
                >
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 2 }}>
                    {context.text || 'No text submitted.'}
                  </Typography>
                </Paper>
              )}
            </Box>

            <Box
              sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}
            >
              {categories.length > 0 ? (
                <Button
                  variant="contained"
                  onClick={() => setOpenFeedback(true)}
                  startIcon={<AutoAwesomeIcon sx={{ color: '#fbc02d' }} />}
                  sx={{
                    bgcolor: 'primary.main',
                    '&:hover': { bgcolor: 'primary.dark' },
                    borderRadius: 2,
                    px: 4,
                    py: 1.5,
                    fontWeight: 'bold',
                  }}
                >
                  View AI Feedback
                </Button>
              ) : (
                <>
                  <MuiTooltip
                    title={
                      totalTurns <= 0
                        ? 'You have run out of AI turns. Cannot use this feature.'
                        : ''
                    }
                    placement="top"
                  >
                    <span
                      style={{
                        display: 'inline-block',
                        cursor: totalTurns <= 0 ? 'not-allowed' : 'pointer',
                      }}
                    >
                      <Button
                        variant="contained"
                        onClick={async () => {
                          if (!context.historyId) return;
                          setIsFetchingFeedback(true);
                          try {
                            const feedbackRes = isSpeaking
                              ? await getSpeakingAIFeedback({ id: context.historyId })
                              : await getAIFeedback({ id: context.historyId });
                            localStorage.setItem(
                              'category',
                              JSON.stringify(feedbackRes.ai_feedback),
                            );
                            const nextTurns = normalizeTurns(feedbackRes.remaining_turns);
                            setTurns(nextTurns);
                            localStorage.setItem('remainAIturns', JSON.stringify(nextTurns));
                            window.location.reload();
                          } catch (error) {
                            if (
                              error?.status >= 500 ||
                              error?.response?.status >= 500 ||
                              error?.message?.includes('500')
                            ) {
                              setServerErrorOpen(true);
                            } else {
                              alert('Failed to get AI Feedback. Please try again.');
                            }
                          } finally {
                            setIsFetchingFeedback(false);
                          }
                        }}
                        disabled={isFetchingFeedback || totalTurns <= 0}
                        startIcon={
                          isFetchingFeedback ? (
                            <> </>
                          ) : (
                            <AutoAwesomeIcon sx={{ color: '#fbc02d' }} />
                          )
                        }
                        sx={{
                          bgcolor: 'primary.main',
                          '&:hover': { bgcolor: 'primary.dark' },
                          borderRadius: 2,
                          px: 4,
                          py: 1.5,
                          fontWeight: 'bold',
                          pointerEvents: totalTurns <= 0 ? 'none' : 'auto',
                        }}
                      >
                        {isFetchingFeedback ? 'Evaluating...' : 'Request AI Feedback'}
                      </Button>
                    </span>
                  </MuiTooltip>
                </>
              )}
            </Box>

            <Backdrop
              sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 999 }}
              open={isFetchingFeedback}
            >
              <AIGradingLoading />
            </Backdrop>

            <Dialog
              open={serverErrorOpen}
              onClose={handleServerErrorClose}
              PaperProps={{ sx: { borderRadius: 3, p: 2, minWidth: 320 } }}
            >
              <DialogTitle sx={{ fontWeight: 'bold', color: 'error.main' }}>
                Server Error
              </DialogTitle>
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

          {/* RIGHT COLUMN: Feedback & Score */}
          <Dialog
            open={openFeedback && categories.length > 0}
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
                      <RechartsTooltip content={<CustomTooltip />} />
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
                            {cat.score?.toFixed(1)}
                          </Box>
                        </Stack>
                        <Box sx={styles.feedbackIconWrapper}>
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
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" fontWeight="800" color="text.primary">
                      {totalTurns} left
                    </Typography>
                  </Box>
                </Stack>
                <Button
                  variant="contained"
                  sx={styles.tryAgainButton}
                  onClick={() =>
                    router.push(
                      `/student/${isSpeaking ? 'speaking' : 'writing'}/${testId}/${parseInt(attempt) + 1}`,
                    )
                  }
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
