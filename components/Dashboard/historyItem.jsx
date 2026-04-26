/* global sessionStorage, setInterval, clearInterval */
'use client';
import React from 'react';
import { Paper, Stack, Box, Typography, Button } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import * as styles from '@/styles/Student/HistoryTestStyles';
import { useRouter } from 'next/navigation';

export default function HistoryItem({ data, filterSkill }) {
  const router = useRouter();

  const isScoreType = filterSkill === 'L' || filterSkill === 'R';

  const handleViewDetail = (item) => {
    let dataToSave = {};

    const storageKey = ['R', 'L'].includes(filterSkill)
      ? 'current_receptive_attempt'
      : 'current_productive_attempt';

    if (storageKey === 'current_receptive_attempt') {
      dataToSave = {
        history_id: item.id,
        answer_histories: item.answer_histories,
        isReadOnly: item.type === 'S',
        startTime: item.start_time,
        totalTime: item.total_time,
        bonus_point: item.bonus_point,
        earned_bonus_point: item.earned_bonus_point,
        total_score: item.total_score,
        feedback_message: item.feedback_message,
      };
    } else {
      dataToSave = {
        answer: item.user_answer_text,
        note: item.user_note_text,
        isReadOnly: item.type === 'S',
        startTime: item.start_time,
        totalTime: item.total_time,
        audio: item.audio_path,
      };
    }
    sessionStorage.setItem(storageKey, JSON.stringify(dataToSave));

    const skillPaths = {
      R: 'reading',
      L: 'listening',
      W: 'writing',
      S: 'speaking',
    };

    const path = skillPaths[filterSkill] || 'reading';
    router.push(`/student/${path}/${item.receptive_test || item.productive_test}/${item.attempt}`);
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
            <Typography
              variant="caption"
              fontWeight={700}
              color="yellow.main"
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
            >
              {isScoreType ? (
                <EmojiEventsIcon sx={{ fontSize: '1rem' }} />
              ) : (
                <StarIcon sx={{ fontSize: '1rem' }} />
              )}{' '}
              {isScoreType ? data.total_score : data.earned_bonus_point}
            </Typography>
            <Typography
              variant="caption"
              fontWeight={700}
              color="text.secondary"
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
            >
              <AccessTimeIcon sx={{ fontSize: '1rem' }} /> {formatTime(data.total_time)} mins
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
