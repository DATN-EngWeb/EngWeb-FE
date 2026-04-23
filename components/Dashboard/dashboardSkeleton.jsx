'use client';

import React from 'react';
import { Container, Box, Paper, Stack } from '@mui/material';
import { keyframes } from '@mui/system';

const shimmer = keyframes`
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
`;

const skeletonBase = {
  background: 'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)',
  backgroundSize: '200% 100%',
  animation: `${shimmer} 1.5s infinite linear`,
};

const SkeletonBox = ({ width, height, borderRadius = '8px', sx = {} }) => (
  <Box
    sx={{
      ...skeletonBase,
      width: width || '100%',
      height: height || '20px',
      borderRadius,
      ...sx,
    }}
  />
);

export default function SkeletonStudentDashboard() {
  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 }, px: { xs: 2, md: 10, lg: 20 } }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '300px minmax(0, 1fr)' },
          gap: 2,
          alignItems: 'start',
        }}
      >
        {/* Left Column - Level Points Panel & Streak Progress */}
        <Stack spacing={2}>
          {/* Level Points Panel Skeleton */}
          <Paper
            elevation={0}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              p: 2.25,
              borderRadius: '1.25rem',
              boxShadow: 'none',
            }}
          >
            <Stack spacing={2}>
              {/* Header */}
              <Stack direction="row" spacing={1.2} alignItems="center">
                <SkeletonBox width="40px" height="40px" borderRadius="14px" />
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <SkeletonBox width="120px" height="20px" sx={{ mb: 0.5 }} />
                  <SkeletonBox width="180px" height="12px" />
                </Box>
              </Stack>

              {/* Current Level Card */}
              <Paper
                variant="outlined"
                sx={{
                  p: 1.4,
                  borderRadius: 3,
                  bgcolor: 'background.default',
                  borderColor: 'divider',
                }}
              >
                <Stack spacing={0.9}>
                  {/* Level Info */}
                  <Stack direction="row" spacing={0.9} alignItems="center">
                    <SkeletonBox width="36px" height="36px" borderRadius="9px" />
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <SkeletonBox width="80px" height="12px" sx={{ mb: 0.5 }} />
                      <SkeletonBox width="150px" height="16px" />
                    </Box>
                  </Stack>

                  {/* Progress Bar */}
                  <SkeletonBox height="22px" borderRadius="999px" />

                  {/* XP Info */}
                  <SkeletonBox width="180px" height="12px" />
                </Stack>
              </Paper>

              <Box sx={{ borderTop: '1px solid', borderColor: 'divider' }} />

              {/* All Levels Section */}
              <Stack spacing={1.2}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}>
                  <SkeletonBox width="70px" height="18px" />
                  <SkeletonBox width="100px" height="32px" borderRadius="999px" />
                </Stack>
              </Stack>
            </Stack>
          </Paper>

          {/* Streak Progress Skeleton */}
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
              <SkeletonBox width="80px" height="24px" />
              <SkeletonBox width="40px" height="40px" borderRadius="50%" />
            </Stack>

            {/* Streak Count */}
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: { xs: 80, md: 100 },
              }}
            >
              <SkeletonBox width="120px" height="60px" />
            </Box>

            {/* Footer */}
            <Stack
              spacing={1.5}
              sx={{ pt: 2, borderTop: '1px solid', borderColor: 'divider', width: '100%' }}
            >
              {/* Best Streak */}
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <SkeletonBox width="36px" height="36px" borderRadius="4px" />
                <Box sx={{ flex: 1 }}>
                  <SkeletonBox width="80px" height="12px" sx={{ mb: 0.5 }} />
                  <SkeletonBox width="100px" height="18px" />
                </Box>
              </Stack>

              {/* Last Activity */}
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <SkeletonBox width="36px" height="36px" borderRadius="4px" />
                <Box sx={{ flex: 1 }}>
                  <SkeletonBox width="100px" height="12px" sx={{ mb: 0.5 }} />
                  <SkeletonBox width="120px" height="18px" />
                </Box>
              </Stack>
            </Stack>
          </Paper>
        </Stack>

        {/* Right Column - Overall Progress & Progress History */}
        <Stack spacing={2}>
          {/* Overall Progress Skeleton */}
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
            <SkeletonBox width="180px" height="28px" />

            {/* Header Tabs & Filter Controls Skeleton */}
            <Box
              sx={{
                display: { xs: 'grid', md: 'flex' },
                gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'none' },
                justifyContent: { xs: 'center', md: 'space-between' },
                gap: 1,
                width: '100%',
              }}
            >
              {/* Desktop Tabs */}
              <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
                {[1, 2, 3, 4].map((i) => (
                  <SkeletonBox key={i} width="120px" height="40px" />
                ))}
              </Box>

              {/* Mobile Tab Select */}
              <Box sx={{ display: { xs: 'flex', md: 'none' }, width: '100%' }}>
                <SkeletonBox width="100%" height="40px" borderRadius="8px" />
              </Box>

              {/* Filter Controls */}
              <Box sx={{ display: 'flex', width: { xs: '100%', md: 'auto' } }}>
                <SkeletonBox width={{ xs: '100%', md: '120px' }} height="40px" borderRadius="8px" />
              </Box>
            </Box>

            {/* Content Area Skeleton */}
            <Box
              sx={{
                width: '100%',
                bgcolor: 'background.gray',
                borderRadius: '1rem',
                minHeight: 400,
                display: 'flex',
                flexDirection: 'column',
                gap: { xs: 1, md: 2 },
                p: 2,
              }}
            >
              {/* Chart Placeholder */}
              <SkeletonBox height="250px" borderRadius="1rem" />

              {/* Stats Grid Skeleton */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
                  gap: { xs: 1, md: 2 },
                  width: '100%',
                }}
              >
                {[1, 2, 3, 4].map((i) => (
                  <SkeletonBox key={i} height="100px" borderRadius="12px" />
                ))}
              </Box>
            </Box>
          </Paper>

          {/* Progress History Skeleton */}
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
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ width: '100%' }}
            >
              <SkeletonBox width="160px" height="28px" />
              <Stack direction="row" gap={1} alignItems="center">
                <SkeletonBox width="100px" height="40px" borderRadius="8px" />
                <SkeletonBox width="120px" height="40px" borderRadius="8px" />
              </Stack>
            </Stack>

            {/* History Items Grid Skeleton */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                gap: 2,
                width: '100%',
              }}
            >
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <SkeletonBox key={i} height="90px" borderRadius="1rem" />
              ))}
            </Box>

            {/* Pagination Skeleton */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, width: '100%' }}>
              <SkeletonBox width="300px" height="40px" borderRadius="8px" />
            </Box>
          </Paper>
        </Stack>
      </Box>
    </Container>
  );
}
