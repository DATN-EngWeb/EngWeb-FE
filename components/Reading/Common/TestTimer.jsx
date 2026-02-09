/* global setInterval, clearInterval */
'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const TestTimer = () => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (totalSeconds) => {
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
        backgroundColor: 'background.paper',
        px: 2,
        py: 1,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        width: '120px',
        minWidth: '120px',
        position: 'relative',
        justifyContent: 'center',
      }}
    >
      <AccessTimeIcon
        sx={{
          color: 'secondary.main',
          fontSize: 20,
          position: 'absolute',
          left: '12px',
        }}
      />
      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          color: 'text.primary',
          fontSize: '1.1rem',
          fontVariantNumeric: 'tabular-nums',
          ml: 3, // Offset for the absolute icon
        }}
      >
        {formatTime(seconds)}
      </Typography>
    </Box>
  );
};

export default TestTimer;
