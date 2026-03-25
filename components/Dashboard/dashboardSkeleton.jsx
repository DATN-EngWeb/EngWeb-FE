'use client';

import React from 'react';
import { Container, Box, Paper, Stack, Grid } from '@mui/material';
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
    <Container maxWidth="md" sx={{ py: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* ------------------ Overall Progress Section ------------------ */}
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

        {/* Tabs Skeleton */}
        <Box
          sx={{
            display: { xs: 'grid', sm: 'flex' },
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'none' },
            gap: 1,
            width: '100%',
          }}
        >
          {[1, 2, 3, 4].map((i) => (
            <SkeletonBox key={i} width={{ xs: '100%', sm: '120px' }} height="40px" />
          ))}
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

      {/* ------------------ Progress History Section ------------------ */}
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
          <SkeletonBox width="120px" height="40px" />
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
          <SkeletonBox width="300px" height="40px" />
        </Box>
      </Paper>
    </Container>
  );
}
