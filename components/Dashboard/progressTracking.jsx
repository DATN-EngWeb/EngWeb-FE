/* global sessionStorage, setInterval, clearInterval */
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Paper, Typography, Box, Stack } from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import * as styles from '../../styles/student/HistoryTestStyles';
import { getProductiveTestHistory, getReceptiveTestHistory } from '@/api/test';

export default function ProgressTracking({ historyData, type, activeTab }) {
  const router = useRouter();

  const handleViewDetail = async (historyId) => {
    if (!historyId) return;
    console.log('Fetching ID:', historyId);
    let res;
    if (type === 'R') {
      res = await getReceptiveTestHistory(historyId);
    } else {
      res = await getProductiveTestHistory(historyId);
    }
    let dataToSave;
    if (type === 'R') {
      dataToSave = {
        history_id: res.id,
        answer_histories: res.answer_histories,
        isReadOnly: res.type === 'S',
        startTime: res.start_time,
        totalTime: res.total_time,
      };
    } else {
      dataToSave = {
        answer: res.user_answer_text,
        note: res.user_note_text,
        isReadOnly: res.type === 'S',
        startTime: res.start_time,
        totalTime: res.total_time,
        audio: res.audio_path,
      };
    }

    const storageKey = ['READING', 'LISTENING'].includes(activeTab)
      ? 'current_receptive_attempt'
      : 'current_productive_attempt';

    sessionStorage.setItem(storageKey, JSON.stringify(dataToSave));

    const skillPaths = {
      READING: 'reading',
      LISTENING: 'listening',
      WRITING: 'writing',
      SPEAKING: 'speaking',
    };

    const path = skillPaths[activeTab] || 'reading';
    const testId = type === 'R' ? res.receptive_test : res.productive_test;
    const attempt = type === 'R' ? res.attempt : res.attempt;
    router.push(`/student/${path}/${testId}/${attempt}`);
  };

  if (historyData.length === 0) {
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

  const CustomActiveDot = (props) => {
    const { cx, cy, payload } = props;
    if (!cx || !cy) return null;

    return (
      <g
        onClick={() => handleViewDetail(payload.history_id)}
        style={{
          cursor: 'pointer',
          outline: 'none',
          border: 'none',
          WebkitTapHighlightColor: 'transparent',
          userSelect: 'none',
          pointerEvents: 'all',
        }}
        tabIndex="-1"
      >
        <circle
          cx={cx}
          cy={cy}
          r={10}
          fill="red"
          fillOpacity={0}
          stroke="none"
          style={{ outline: 'none' }}
        />
        {/* Chấm vàng */}
        <circle
          cx={cx}
          cy={cy}
          r={6}
          fill="#ffb300"
          stroke="#fff"
          strokeWidth={2}
          style={{ pointerEvents: 'none' }}
        />
      </g>
    );
  };

  const chartData = [...historyData]
    .reverse()
    .slice(-historyData.length)
    .map((h, index) => ({
      date: new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit' }),
      score: (type === 'R' ? h.normalized_score : h.earned_bonus_point) || 0,
      id: index,
      history_id: h.history_id,
    }));

  // 2. find best score today
  const today = new Date().toLocaleDateString('en-US');
  const todaySubmissions =
    historyData?.filter((h) => {
      const isToday = new Date(h.date).toLocaleDateString('en-US') === today;
      return isToday;
    }) || [];

  const bestScoreToday =
    todaySubmissions.length > 0
      ? Math.max(
          ...todaySubmissions.map(
            (h) => (type === 'R' ? h.normalized_score : h.earned_bonus_point) || 0,
          ),
        )
      : null;

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
          LAST {historyData.length} ATTEMPTS
        </Typography>
      </Stack>

      {/* chart area */}
      <Box sx={{ width: '100%', height: 180, mt: 2, mb: 2 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            style={{ cursor: 'pointer' }}
            onClick={(e) => {
              if (e && e.activePayload && e.activePayload.length > 0) {
                handleViewDetail(e.activePayload[0].payload.history_id);
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis
              dataKey="id"
              tickFormatter={(id) => chartData[id]?.date}
              interval={Math.ceil(chartData.length / 8)}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fontWeight: 600, fill: '#9e9e9e' }}
              dy={10}
            />
            <YAxis hide domain={[0, 100]} />
            <Tooltip
              wrapperStyle={{ pointerEvents: 'none' }}
              labelFormatter={(id) => chartData[id]?.date}
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
              dot={{ r: 4, fill: '#ffb300', strokeWidth: 2, stroke: '#fff', cursor: 'pointer' }}
              activeDot={<CustomActiveDot />}
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
            TODAY'S BEST
          </Typography>
          <Stack direction="row" alignItems="baseline" spacing={0.5}>
            {bestScoreToday !== null ? (
              <>
                <Typography variant="h5" fontWeight={900} color="#276749">
                  {bestScoreToday}
                </Typography>
                <Typography variant="caption" fontWeight={700} color="#276749">
                  /100
                </Typography>
              </>
            ) : (
              <Typography variant="body2" fontWeight={800} color="#276749">
                NO TESTS TODAY
              </Typography>
            )}
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
