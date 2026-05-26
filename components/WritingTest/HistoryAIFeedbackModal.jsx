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
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import {
  LightbulbOutlined,
  CheckCircleOutline,
  BarChart,
  FlashOn,
  Close as CloseIcon,
} from '@mui/icons-material';
import * as styles from '@/styles/Student/Writing/AIFeedbackStyles';

export default function HistoryAIFeedbackModal({ open, onClose, data }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      scroll="paper"
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 3,
          m: isMobile ? 0 : 2,
          width: '100%',
          maxHeight: isMobile ? '100%' : 'calc(100% - 32px)',
        },
      }}
    >
      <DialogTitle
        sx={{
          m: 0,
          p: { xs: 1.5, sm: 2.5 },
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: { xs: 1.25, sm: 2 },
          bgcolor: '#F9F6F0',
          borderBottom: '1px solid #eee',
        }}
      >
        <Box sx={{ width: '100%' }}>
          <Typography
            variant="h5"
            fontWeight="800"
            color="primary.main"
            sx={{ fontSize: { xs: '1.5rem', sm: '1.5rem' } }}
          >
            AI Feedback Result
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: { xs: 'space-between', sm: 'flex-end' },
            gap: { xs: 1, sm: 3 },
            width: '100%',
          }}
        >
          <Stack direction="row" alignItems="center" sx={{ flex: 1 }}>
            <Box textAlign={{ xs: 'left', sm: 'right' }}>
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
                sx={{ lineHeight: 1, mt: 0.5, fontSize: { xs: '1.6rem', sm: '2.125rem' } }}
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
              position: 'absolute',
              top: 12,
              right: 12,
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              '&:hover': { bgcolor: '#eceff1' },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ px: { xs: 1.5, sm: 3 }, py: { xs: 1.5, sm: 2.5 } }}>
        {/* HEADER SECTION */}
        <Box
          sx={{
            ...styles.summaryCard,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            width: '100%',
            mb: { xs: 2.5, sm: 5 },
            gap: { xs: 2, sm: 0 },
          }}
        >
          {/* Overall Summary */}
          <Box sx={{ display: 'flex', width: { xs: '100%', sm: '50%' } }}>
            <Box sx={{ p: { xs: 0, sm: 2 }, width: '100%' }}>
              <CardContent>
                <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                  <BarChart color="warning" />
                  <Typography
                    variant="h6"
                    fontWeight="700"
                    sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                  >
                    Overall Summary
                  </Typography>
                </Stack>
                <Typography variant="caption" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                  {overall.summary}
                </Typography>
              </CardContent>
            </Box>
          </Box>

          {/* next actions*/}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              width: { xs: '100%', sm: '50%' },
            }}
          >
            <Box sx={{ p: { xs: 0, sm: 2 }, width: '100%' }}>
              <Card sx={styles.NextActionCard}>
                <CardContent>
                  <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                    <FlashOn sx={{ color: '#fbc02d' }} />
                    <Typography
                      variant="h6"
                      fontWeight="700"
                      sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                    >
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
                          <Typography
                            variant="caption"
                            color="text.primary"
                            fontWeight="500"
                            sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                          >
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
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 2, sm: 3 } }}>
          {categories.map((cat, index) => (
            <Box
              key={index}
              sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)' }, display: 'flex' }}
            >
              <Card sx={{ ...styles.categoryCard, width: '100%' }}>
                <CardContent>
                  <Box sx={styles.categoryHeader}>
                    <Typography
                      variant="subtitle1"
                      fontWeight="800"
                      textTransform="capitalize"
                      sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
                    >
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
                        sx={{ fontSize: { xs: '0.72rem', sm: '0.75rem' } }}
                      >
                        <CheckCircleOutline sx={{ fontSize: 14 }} /> STRENGTHS
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                      >
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
                        sx={{ fontSize: { xs: '0.72rem', sm: '0.75rem' } }}
                      >
                        <LightbulbOutlined sx={{ fontSize: 14 }} /> IMPROVEMENTS
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                      >
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
