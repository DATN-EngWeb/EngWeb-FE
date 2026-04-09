import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from '@mui/material';
import {
  LightbulbOutlined,
  CheckCircleOutline,
  BarChart,
  FlashOn,
  Close as CloseIcon,
} from '@mui/icons-material';
import * as styles from '@/styles/student/Writing/AIFeedbackStyles';

export default function HistoryAIFeedbackModal({ open, onClose, data }) {
  const [categories, setCategories] = useState([]);
  const [overall, setOverall] = useState({ summary: '', next_actions: '' });

  useEffect(() => {
    if (!data) return;

    // 1. Extract specific non-category items first
    const { revised_text, overall: overallData, ...categoriesOnly } = data;

    if (overallData) {
      setOverall({
        summary: overallData.summary || '',
        next_actions: overallData.next_actions || '',
      });
    }

    // 3. Map only the remaining category objects
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
  }, [data]);

  const overallScore = categories.reduce((acc, cat) => acc + cat.score, 0) / categories.length || 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          m: 0,
          p: 2.5,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: '#F9F6F0',
          borderBottom: '1px solid #eee',
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight="800" color="primary.main">
            AI Feedback Result
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Stack direction="row" alignItems="center">
            <Box textAlign="right">
              <Typography
                variant="body2"
                color="text.secondary"
                fontWeight="700"
                sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
              >
                Overall Score
              </Typography>
              <Typography
                variant="h4"
                fontWeight="900"
                color="warning.main"
                sx={{ lineHeight: 1, mt: 0.5 }}
              >
                Band {overallScore.toFixed(1)}
                <Typography component="span" variant="h6" color="text.disabled" fontWeight="700">
                  {' '}
                  / 5.0
                </Typography>
              </Typography>
            </Box>
          </Stack>
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              color: 'text.secondary',
              bgcolor: '#fff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              '&:hover': { bgcolor: '#eceff1' },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* HEADER SECTION */}
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
                <Typography variant="caption">{overall.summary}</Typography>
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
                      ?.split(/(?=\d+\.\s)/)
                      .filter((text) => text.trim() !== '')
                      .map((text, i) => (
                        <Stack key={i} direction="row" spacing={1.5} alignItems="flex-start" mb={1}>
                          <CheckCircleOutline sx={{ color: '#ed6c02', fontSize: 18, mt: 0.3 }} />
                          <Typography variant="caption" color="text.primary" fontWeight="500">
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
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {categories.map((cat, index) => (
            <Box
              key={index}
              sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)' }, display: 'flex' }}
            >
              <Card sx={{ ...styles.categoryCard, width: '100%' }}>
                <CardContent>
                  <Box sx={styles.categoryHeader}>
                    <Typography variant="subtitle1" fontWeight="800" textTransform="capitalize">
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
      </DialogContent>
    </Dialog>
  );
}
