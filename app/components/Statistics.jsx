import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import Image from 'next/image';
import StatisticsImage from '../assets/statistic.png';
import { statisticsStyles } from '../styles/StatisticsStyles';

const stats = [
  { number: '500+', label: 'Students Reached', color: '#ff8a3d' },
  { number: '100+', label: 'Teacher Reached', color: '#ff8a3d' },
  { number: '236', label: 'Exams', color: '#ff8a3d' },
];

export default function Statistics() {
  return (
    <Box sx={statisticsStyles.mainContainer}>
      <Container maxWidth="lg">
        {/* Top row: title + image */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            flexDirection: { xs: 'column', md: 'row' },
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography variant="h2" sx={statisticsStyles.mainTitle}>
              English made simple — learn smarter, speak better, and reach your goals faster.
            </Typography>
          </Box>
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              justifyContent: { xs: 'center', md: 'flex-end' },
              alignItems: 'center',
            }}
          >
            <Image
              src={StatisticsImage}
              alt="NENS"
              style={{ width: '50%', height: 'auto', maxWidth: '100%' }}
            />
          </Box>
        </Box>

        {/* Bottom row: stats + description */}
        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 12, mt: 2, flexWrap: 'wrap' }}>
          <Box sx={{ minWidth: { xs: '45%', md: 'auto' } }}>
            <Typography variant="h3" sx={statisticsStyles.statNumber}>
              500+
            </Typography>
            <Typography variant="body2" sx={statisticsStyles.statLabel}>
              Students Reached
            </Typography>
          </Box>
          <Box sx={{ minWidth: { xs: '45%', md: 'auto' } }}>
            <Typography variant="h3" sx={statisticsStyles.statNumber}>
              100+
            </Typography>
            <Typography variant="body2" sx={statisticsStyles.statLabel}>
              Teacher Reached
            </Typography>
          </Box>
          <Box sx={{ minWidth: { xs: '45%', md: 'auto' } }}>
            <Typography variant="h3" sx={statisticsStyles.statNumber}>
              236
            </Typography>
            <Typography variant="body2" sx={statisticsStyles.statLabel}>
              Exams
            </Typography>
          </Box>
          <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={statisticsStyles.description}>
              Discover interactive lessons, fun activities, and real-world conversations that make
              English learning exciting at every level.
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
