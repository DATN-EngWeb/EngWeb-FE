/* global sessionStorage, setInterval, clearInterval */
'use client';
import React from 'react';
import { Paper, Stack, Box, Typography, Chip, Button } from '@mui/material';
import * as styles from '../../styles/student/HistoryTestStyles';
import { useRouter } from 'next/navigation';

export default function HistoryItem({ data, filterSkill }) {
  const router = useRouter();
  const handleViewDetail = (item) => {
    const dataToSave = {
      answer_histories: item.answer_histories,
      isReadOnly: item.type === 'S',
      startTime: item.start_time,
      totalTime: item.total_time,
    };

    const storageKey = ['R', 'L'].includes(filterSkill)
      ? 'current_receptive_attempt'
      : 'current_productive_attempt';

    sessionStorage.setItem(storageKey, JSON.stringify(dataToSave));

    const skillPaths = {
      R: 'reading',
      L: 'listening',
      W: 'writing',
      S: 'speaking',
    };

    const path = skillPaths[filterSkill] || 'reading';
    router.push(`/student/${path}/${item.receptive_test}/${item.attempt}`);
  };

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Paper sx={{ ...styles.historyItemPaper, p: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <Typography
              variant="subtitle2"
              fontWeight={800}
              color="text.secondary"
              sx={{
                maxWidth: '240px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {data.test_title}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Typography variant="caption" fontWeight={700} color="#ffb300">
              ⭐ 100 XP
            </Typography>
            <Typography variant="caption" fontWeight={700} color="text.secondary">
              ⏱️ {formatTime(data.total_time)} mins
            </Typography>
            <Typography variant="caption" fontWeight={700} color="text.secondary">
              {data.end_time &&
                new Date(data.end_time).toLocaleDateString('vi-VN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })}
            </Typography>
          </Stack>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            size="small"
            sx={{
              bgcolor: '#f5f5f5',
              color: '#4e342e',
              boxShadow: 'none',
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: '8px',
            }}
            onClick={() => handleViewDetail(data)}
          >
            View Detail
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}
