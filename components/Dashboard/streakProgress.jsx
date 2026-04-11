'use client';

import StreakBadge from '../Streak/streakBadge';
import { useStreakContext } from '@/context/streakContext';
import { formatDate } from '@/utils/stringFormat';
import { Box, Paper, Stack, Typography } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

export default function StreakProgress() {
  const { streakData } = useStreakContext();

  return (
    <Paper
      elevation={0}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'start',
        gap: 2,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        p: 2,
        borderRadius: '1rem',
      }}
    >
      {/* Streak Header */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ width: '100%' }}
      >
        <Typography
          variant="h1"
          sx={{ fontWeight: 800, color: 'primary.main', fontSize: { xs: 20, md: 24 } }}
        >
          Streak
        </Typography>
        <StreakBadge isHaveText={false} />
      </Stack>
      {/* Content */}
      <Stack
        alignItems="center"
        justifyContent="center"
        sx={{ width: '100%', height: { xs: 80, md: 100 } }}
      >
        <Stack direction="row" alignItems="baseline" spacing={0.5} sx={{ color: 'primary.main' }}>
          <Typography
            sx={{
              fontSize: '3rem',
              fontWeight: 900,
              letterSpacing: '-0.05em',
              lineHeight: 1,
            }}
          >
            {streakData?.streak_count}
          </Typography>
          <Typography
            sx={{
              fontSize: '1rem',
              fontWeight: 'bold',
              opacity: 0.9,
            }}
          >
            days
          </Typography>
        </Stack>
        {/* Chú thích bên dưới */}
        <Typography
          sx={{
            fontSize: '10px',
            fontWeight: 'bold',
            opacity: 0.75,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            mt: 0.5,
          }}
        >
          Streak
        </Typography>
      </Stack>
      {/* Footer */}
      <Stack
        spacing={1.5}
        sx={{
          pt: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
          width: '100%',
        }}
      >
        {/* Hàng kỷ lục - Best Record */}
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              p: 0.75,
              bgcolor: 'rgba(83, 40, 34, 0.1)',
              borderRadius: 1,
              display: 'flex',
            }}
          >
            <EmojiEventsIcon sx={{ fontSize: 16, color: '#532822' }} />
          </Box>
          <Box>
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                fontSize: '9px',
                fontWeight: 'bold',
                opacity: 0.7,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                lineHeight: 1,
                mb: 0.5,
              }}
            >
              Best Streak
            </Typography>
            <Typography sx={{ fontSize: '1rem', fontWeight: 'bold', lineHeight: 1 }}>
              {streakData?.max_streak} days
            </Typography>
          </Box>
        </Stack>
        {/* Last Activity */}
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              p: 0.75,
              bgcolor: 'rgba(83, 40, 34, 0.1)',
              borderRadius: 1,
              display: 'flex',
            }}
          >
            <CalendarMonthIcon sx={{ fontSize: 16, color: '#532822' }} />
          </Box>
          <Box>
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                fontSize: '9px',
                fontWeight: 'bold',
                opacity: 0.7,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                lineHeight: 1,
                mb: 0.5,
              }}
            >
              Last Activity
            </Typography>
            <Typography sx={{ fontSize: '1rem', fontWeight: 'bold', lineHeight: 1 }}>
              {streakData?.last_submitted_date ? formatDate(streakData.last_submitted_date) : 'N/A'}
            </Typography>
          </Box>
        </Stack>
      </Stack>
    </Paper>
  );
}
