/* global sessionStorage, setInterval, clearInterval */
'use client';
import React from 'react';
import { Paper, Stack, Box, Typography, Chip, Button, IconButton } from '@mui/material';
import ShareIcon from '@mui/icons-material/Share';
import * as styles from './../../styles/student/HistoryTestStyles';
import { useRouter } from 'next/navigation';

export default function HistoryItem({ data }) {
  const router = useRouter();
  const handleViewDetail = (item) => {
    const dataToSave = {
      answer: item.user_answer_text,
      note: item.user_note_text,
      isReadOnly: item.type === 'S',
      startTime: item.start_time,
      totalTime: item.total_time,
      audio: item.audio_path,
    };
    sessionStorage.setItem('current_productive_attempt', JSON.stringify(dataToSave));
    {
      item.skill === 'S'
        ? router.push(`/student/speaking/${item.productive_test}/${item.attempt}`)
        : router.push(`/student/writing/${item.productive_test}/${item.attempt}`);
    }
  };
  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  return (
    <Paper elevation={0} sx={styles.historyItemPaper}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="subtitle2" fontWeight={800} color="text.secondary">
              {data.end_time &&
                new Date(data.end_time).toLocaleDateString('vi-VN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })}
            </Typography>
            {data.is_shared && (
              <Chip
                label="SHARED TO FORUM"
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.6rem',
                  fontWeight: 800,
                  bgcolor: '#e3f2fd',
                  color: '#1976d2',
                }}
              />
            )}
            <Chip
              label="AI REVIEWED"
              size="small"
              sx={{
                height: 20,
                fontSize: '0.6rem',
                fontWeight: 800,
                bgcolor: '#f3e5f5',
                color: '#9c27b0',
              }}
            />
          </Stack>
          <Stack direction="row" spacing={3}>
            <Typography variant="caption" fontWeight={700} color="#ffb300">
              ⭐ 100 XP
            </Typography>
            {data.skill === 'W' && (
              <Typography variant="caption" fontWeight={700} color="text.secondary">
                📄 {data.min_words} words
              </Typography>
            )}

            <Typography variant="caption" fontWeight={700} color="text.secondary">
              ⏱️ {formatTime(data.total_time)} mins
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
          <IconButton size="small" sx={{ bgcolor: '#f5f5f5' }}>
            <ShareIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Stack>
    </Paper>
  );
}
