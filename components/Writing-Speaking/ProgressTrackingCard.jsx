import React from 'react';
import { Paper, Typography, Box, Stack } from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import * as styles from '@/styles/Student/HistoryTestStyles';
export default function ProgressTrackingCard({ historyData, type }) {
  const submissions = historyData?.filter((h) => h.type === 'S') || [];

  if (submissions.length === 0) {
    return (
      <Paper elevation={0} sx={styles.sidebarPaper}>
        <Typography variant="subtitle2" fontWeight={800} textAlign="left" mb={2}>
          Progress Tracking
        </Typography>
        <Box
          sx={{
            height: 180,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            bgcolor: '#fafafa',
            borderRadius: '16px',
          }}
        >
          <Typography variant="caption" color="text.secondary" fontWeight={700}>
            NO DATA AVAILABLE
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Awaiting first submission
          </Typography>
        </Box>
      </Paper>
    );
  }
  const chartData = [...historyData]
    .filter((h) => h.type === 'S')
    .reverse()
    .slice(-5)
    .map((h) => ({
      date: new Date(h.end_time).toLocaleDateString('en-US', { month: 'short', day: '2-digit' }),
      score: (type === 'R' ? h.total_score : h.earned_bonus_point) || 0,
    }));

  // 2. find best score
  const bestScore = Math.max(...chartData.map((d) => d.score), 0);

  return (
    <Paper elevation={0} sx={styles.sidebarPaper}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography
          variant="subtitle2"
          fontWeight={800}
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <Box sx={{ width: 12, height: 12, bgcolor: '#ffb300', borderRadius: '3px' }} />
          Progress Tracking
        </Typography>
        <Typography variant="caption" fontWeight={700} color="text.secondary">
          LAST {submissions.length} ATTEMPTS
        </Typography>
      </Stack>

      {/* chart area */}
      <Box sx={{ width: '100%', height: 180, mt: 2, mb: 2 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fontWeight: 600, fill: '#9e9e9e' }}
              dy={10}
            />
            <YAxis hide domain={[0, 100]} />
            <Tooltip
              contentStyle={{
                borderRadius: '10px',
                border: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#ffb300"
              strokeWidth={4}
              dot={{ r: 4, fill: '#ffb300', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>

      {/* Personal Best Information */}
      <Box
        sx={{
          mt: 2,
          p: 2,
          borderRadius: '16px',
          bgcolor: '#f0fff4',
          border: '1px solid #c6f6d5',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Box sx={{ bgcolor: '#2ecc71', p: 1, borderRadius: '12px', display: 'flex' }}>
          <EmojiEventsIcon sx={{ color: '#fff' }} />
        </Box>
        <Box textAlign="left">
          <Typography variant="caption" fontWeight={800} color="#276749" display="block">
            PERSONAL BEST
          </Typography>
          <Stack direction="row" alignItems="baseline" spacing={0.5}>
            <Typography variant="h5" fontWeight={900} color="#276749">
              {bestScore}
            </Typography>
            <Typography variant="caption" fontWeight={700} color="#276749">
              /100
            </Typography>
          </Stack>
        </Box>
        <Box sx={{ ml: 'auto', textAlign: 'right' }}>
          <Typography variant="caption" color="text.secondary" display="block">
            Achieved on
          </Typography>
          <Typography variant="caption" fontWeight={800}>
            Today
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}
