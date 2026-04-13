'use client';
/* global setInterval, clearInterval */
import React, { useEffect, useState } from 'react';
import { Box, Typography, LinearProgress, Stack, Chip, Paper } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

const STEPS = [
  { label: 'Submission received' },
  { label: 'Analyzing content and structure' },
  { label: 'Evaluating specific criteria' },
  { label: 'Synthesizing final feedback' },
];

const STEP_DURATIONS = [0, 4500, 9000, 14000]; // ms to activate each step

export default function AIGradingLoading({ onComplete }) {
  const [activeStep, setActiveStep] = useState(0);
  const [progress, setProgress] = useState(0);

  // Advance steps on a timer
  useEffect(() => {
    // reset states when mounted
    setActiveStep(0);
    setProgress(0);
    const timers = STEP_DURATIONS.map((delay, idx) => setTimeout(() => setActiveStep(idx), delay));

    // Smooth progress bar
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 92) {
          clearInterval(interval);
          return p;
        }
        return Math.min(p + Math.random() * 3, 92);
      });
    }, 400);

    // Optional completion callback
    const doneTimer = setTimeout(() => {
      setProgress(100);
      onComplete?.();
    }, 18000);

    return () => {
      timers.forEach(clearTimeout);
      clearInterval(interval);
      clearTimeout(doneTimer);
    };
  }, [onComplete]);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 460,
          borderRadius: 3,
          bgcolor: 'background.paper',
          p: { xs: 3, sm: 4 },
        }}
      >
        <Stack spacing={3} alignItems="center">
          {/* Animated AI icon */}
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              bgcolor: 'primary.50',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                inset: -6,
                borderRadius: '50%',
                border: '2.5px solid transparent',
                borderTopColor: 'primary.main',
                animation: 'spin 1.2s linear infinite',
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                inset: -12,
                borderRadius: '50%',
                border: '1.5px solid transparent',
                borderBottomColor: 'success.light',
                animation: 'spin 2s linear infinite reverse',
              },
              '@keyframes spin': {
                from: { transform: 'rotate(0deg)' },
                to: { transform: 'rotate(360deg)' },
              },
            }}
          >
            <AutoAwesomeIcon
              sx={{
                fontSize: 36,
                color: 'primary.main',
                animation: 'pulse 2s ease-in-out infinite',
                '@keyframes pulse': {
                  '0%, 100%': { opacity: 1, transform: 'scale(1)' },
                  '50%': { opacity: 0.6, transform: 'scale(0.88)' },
                },
              }}
            />
          </Box>

          {/* Title */}
          <Box textAlign="center">
            <Typography variant="h6" fontWeight={600} gutterBottom>
              AI is grading your submission
            </Typography>
            <Typography variant="body2" color="text.secondary" lineHeight={1.7}>
              Please wait for a moment.
              <br />
              This process usually takes 10–20 seconds.
            </Typography>
          </Box>

          {/* Progress bar */}
          <Box width="100%">
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 6,
                borderRadius: 99,
                bgcolor: 'grey.100',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 99,
                  background: 'linear-gradient(90deg, #1976d2, #2e7d32)',
                },
              }}
            />
            <Box display="flex" justifyContent="space-between" mt={0.75}>
              <Typography variant="caption" color="text.disabled">
                {activeStep < 2
                  ? 'Analyzing...'
                  : activeStep < 3
                    ? 'Evaluating criteria...'
                    : 'Synthesizing results...'}
              </Typography>
              <Typography variant="caption" color="text.disabled">
                {Math.round(progress)}%
              </Typography>
            </Box>
          </Box>

          {/* Step list */}
          <Stack spacing={1} width="100%">
            {STEPS.map((step, idx) => {
              const done = idx < activeStep;
              const active = idx === activeStep;

              return (
                <Box
                  key={step.label}
                  display="flex"
                  alignItems="center"
                  gap={1.25}
                  sx={{
                    px: 1.75,
                    py: 1.25,
                    borderRadius: 2,
                    bgcolor: active ? 'primary.50' : done ? 'transparent' : 'grey.50',
                    transition: 'background 0.3s ease',
                  }}
                >
                  {done ? (
                    <CheckCircleIcon sx={{ fontSize: 20, color: 'success.main', flexShrink: 0 }} />
                  ) : active ? (
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        flexShrink: 0,
                        display: 'flex',
                        gap: '3px',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {[0, 0.16, 0.32].map((delay) => (
                        <Box
                          key={delay}
                          sx={{
                            width: 5,
                            height: 5,
                            borderRadius: '50%',
                            bgcolor: 'primary.main',
                            animation: 'dotBounce 1.4s ease-in-out infinite both',
                            animationDelay: `${delay}s`,
                            '@keyframes dotBounce': {
                              '0%, 80%, 100%': { transform: 'scale(0)', opacity: 0 },
                              '40%': { transform: 'scale(1)', opacity: 1 },
                            },
                          }}
                        />
                      ))}
                    </Box>
                  ) : (
                    <RadioButtonUncheckedIcon
                      sx={{ fontSize: 20, color: 'text.disabled', flexShrink: 0 }}
                    />
                  )}

                  <Typography
                    variant="body2"
                    color={done ? 'text.disabled' : active ? 'text.primary' : 'text.secondary'}
                    fontWeight={active ? 500 : 400}
                    sx={{ transition: 'color 0.3s' }}
                  >
                    {step.label}
                  </Typography>

                  {active && (
                    <Chip
                      label="Processing"
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ ml: 'auto', fontSize: 11, height: 22 }}
                    />
                  )}
                </Box>
              );
            })}
          </Stack>

          {/* Tip */}
          <Typography
            variant="caption"
            color="text.disabled"
            textAlign="center"
            sx={{
              pt: 1,
              borderTop: '1px solid',
              borderColor: 'divider',
              width: '100%',
            }}
          >
            Tip: Check the detailed feedback after grading to improve your skills.
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}
