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
    };
    sessionStorage.setItem('current_writing_attempt', JSON.stringify(dataToSave));
    router.push(`/student/writing/${item.productive_test}/${item.attempt}`);
  };
  return (
    <Paper sx={styles.historyItemPaper}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="subtitle2" fontWeight={800} color="text.secondary">
              {new Date(data.end_time).toLocaleDateString('vi-VN')}
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
            <Typography variant="caption" fontWeight={700} color="text.secondary">
              📄 {data.word_count || 0} words
            </Typography>
            <Typography variant="caption" fontWeight={700} color="text.secondary">
              ⏱️ {data.total_time || 0} mins
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
