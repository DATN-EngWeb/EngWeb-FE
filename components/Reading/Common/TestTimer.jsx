/* global setInterval, clearInterval */
'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const TestTimer = ({ initialSeconds = 0, isActive = true, value }) => {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive]);

  const formatTime = (totalSeconds) => {
    if (typeof totalSeconds !== 'number') return totalSeconds;

    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    const pad = (num) => String(num).padStart(2, '0');

    if (hrs > 0) {
      return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        color: '#5d4037',
        fontWeight: 700,
        fontSize: '1.25rem',
      }}
    >
      <AccessTimeIcon sx={{ fontSize: 28 }} />
      <Typography
        variant="inherit"
        sx={{
          fontWeight: 700,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value !== undefined ? value : formatTime(seconds)}
      </Typography>
    </Box>
  );
};

export default TestTimer;
