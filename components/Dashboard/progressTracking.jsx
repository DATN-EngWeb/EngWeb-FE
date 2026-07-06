/* global sessionStorage, setInterval, clearInterval */
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Paper, Typography, Box, Stack, Button, ClickAwayListener } from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import * as styles from '@/styles/Student/HistoryTestStyles';
import { getProductiveTestHistory, getReceptiveTestHistory } from '@/api/test';
import theme from '@/theme/theme';

const LEVEL_COLORS = {
  A1: theme.palette.success.main,
  A2: theme.palette.info.main,
  B1: theme.palette.secondary.main,
  B2: '#9c27b0',
};

export default function ProgressTracking({
  allLevelsData = {},
  filterLevelForTab,
  type,
  activeTab,
}) {
  const router = useRouter();
  const [showTooltip, setShowTooltip] = React.useState(true);

  const handleViewDetail = async (historyId) => {
    if (!historyId) return;
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
        bonus_point: res.bonus_point,
        earned_bonus_point: res.earned_bonus_point,
        total_score: res.total_score,
        feedback_message: res.feedback_message,
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

  const selectedLevels =
    filterLevelForTab === 'ALL' ? ['A1', 'A2', 'B1', 'B2'] : [filterLevelForTab];

  // Mỗi attempt là 1 điểm riêng biệt trên trục X (tối đa 30)
  const buildChartData = (allLevelsData, selectedLevels) => {
    const maxLen = Math.max(
      ...selectedLevels.map((l) => allLevelsData[l]?.last_30_attempts?.length || 0),
    );
    const data = [];
    for (let i = 0; i < maxLen; i++) {
      const point = { id: i };
      selectedLevels.forEach((level) => {
        const attempts = [...(allLevelsData[level]?.last_30_attempts || [])].reverse();
        if (i < attempts.length) {
          const h = attempts[i];
          const score = (type === 'R' ? h.normalized_score : h.earned_bonus_point) || 0;
          const d = new Date(h.date);
          point[level] = score;
          point[`${level}_history_id`] = h.history_id;
          point[`${level}_date`] = d.toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
          });
          point[`${level}_time`] = d.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          });
        }
      });
      data.push(point);
    }
    return data;
  };

  const chartData = buildChartData(allLevelsData, selectedLevels);

  if (chartData.length === 0) {
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

  // ── Custom Tooltip: mỗi điểm là 1 attempt ──
  const CustomTooltipContent = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const point = chartData[label];
    if (!point) return null;

    // Sắp xếp theo điểm từ cao xuống thấp
    const sortedPayload = [...payload].sort((a, b) => b.value - a.value);

    return (
      <Paper
        elevation={6}
        sx={{
          p: 1.5,
          borderRadius: 2,
          minWidth: 200,
          maxWidth: 300,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography
          variant="caption"
          fontWeight={800}
          color="text.secondary"
          display="block"
          mb={1}
          sx={{ letterSpacing: 0.5, textTransform: 'uppercase' }}
        >
          Attempt #{label + 1}
        </Typography>
        <Stack spacing={0.75}>
          {sortedPayload.map(({ dataKey: level, value, color }) => (
            <Stack key={level} direction="row" alignItems="center" gap={0.75}>
              <Box
                sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color, flexShrink: 0 }}
              />
              <Typography variant="caption" fontWeight={800} sx={{ color }}>
                {level}
              </Typography>
              <Typography
                variant="caption"
                fontWeight={700}
                sx={{ color: 'text.primary', whiteSpace: 'nowrap' }}
              >
                {value}/100
              </Typography>
              <Typography
                variant="caption"
                color="text.disabled"
                sx={{ fontSize: '0.67rem', ml: 'auto', whiteSpace: 'nowrap' }}
              >
                {point[`${level}_date`]}&nbsp;&middot;&nbsp;{point[`${level}_time`]}
              </Typography>
              <Button
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewDetail(point[`${level}_history_id`]);
                }}
                sx={{
                  minWidth: 'auto',
                  p: '2px 6px',
                  ml: 1,
                  fontSize: '0.65rem',
                  textTransform: 'none',
                  borderRadius: 1,
                  pointerEvents: 'auto',
                  bgcolor: 'action.hover',
                }}
              >
                Result
              </Button>
            </Stack>
          ))}
        </Stack>
      </Paper>
    );
  };

  const CustomActiveDot = (props) => {
    const { cx, cy, payload, dataKey } = props;
    if (!cx || !cy) return null;

    const historyId = payload[`${dataKey}_history_id`];

    return (
      <g
        style={{
          outline: 'none',
          border: 'none',
          WebkitTapHighlightColor: 'transparent',
          userSelect: 'none',
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
        {/* Chấm theo level */}
        <circle
          cx={cx}
          cy={cy}
          r={6}
          fill={LEVEL_COLORS[dataKey] || '#ffb300'}
          stroke="#fff"
          strokeWidth={2}
          style={{ pointerEvents: 'none' }}
        />
      </g>
    );
  };

  // 2. find best score today
  const today = new Date().toLocaleDateString('en-US');
  let bestScoreToday = null;
  selectedLevels.forEach((level) => {
    const attempts = allLevelsData[level]?.last_30_attempts || [];
    const todaySubmissions = attempts.filter(
      (h) => new Date(h.date).toLocaleDateString('en-US') === today,
    );
    if (todaySubmissions.length > 0) {
      const maxScore = Math.max(
        ...todaySubmissions.map(
          (h) => (type === 'R' ? h.normalized_score : h.earned_bonus_point) || 0,
        ),
      );
      if (bestScoreToday === null || maxScore > bestScoreToday) {
        bestScoreToday = maxScore;
      }
    }
  });

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
          LAST 30 ATTEMPTS
        </Typography>
      </Stack>

      <ClickAwayListener onClickAway={() => setShowTooltip(false)}>
        {/* chart area */}
        <Box
          onClick={() => setShowTooltip(true)}
          sx={{
            width: '100%',
            height: 240,
            mt: 2,
            mb: 2,
            '& .recharts-wrapper': { outline: 'none' },
            '& svg': { outline: 'none' },
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              style={{ cursor: 'pointer', outline: 'none' }}
              margin={
                selectedLevels.length > 1
                  ? { top: 6, right: 6, bottom: 0, left: 6 }
                  : { top: 6, right: 16, bottom: 0, left: 16 }
              }
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis
                dataKey="id"
                hide={selectedLevels.length > 1}
                tickFormatter={(id) => {
                  if (selectedLevels.length > 1) return '';
                  const point = chartData[id];
                  return point?.[`${selectedLevels[0]}_date`] || '';
                }}
                interval={Math.max(0, Math.ceil(chartData.length / 8) - 1)}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fontWeight: 600, fill: '#9e9e9e' }}
                dy={10}
              />
              <YAxis hide domain={[0, 100]} />
              {showTooltip && (
                <Tooltip
                  trigger="click"
                  content={<CustomTooltipContent />}
                  wrapperStyle={{ zIndex: 9999, pointerEvents: 'auto' }}
                />
              )}
              {selectedLevels.length > 1 && <Legend iconType="circle" />}
              {selectedLevels.map((level) => (
                <Line
                  key={level}
                  type="monotone"
                  dataKey={level}
                  name={level}
                  stroke={LEVEL_COLORS[level]}
                  strokeWidth={3}
                  dot={{
                    r: 4,
                    fill: LEVEL_COLORS[level],
                    strokeWidth: 2,
                    stroke: '#fff',
                    cursor: 'pointer',
                  }}
                  activeDot={<CustomActiveDot />}
                  connectNulls={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </ClickAwayListener>

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
