import React from 'react';
import { Box, Container, Typography, Grid } from '@mui/material';
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
        <Grid container spacing={2} alignItems="center">
          {/* Hàng đầu: chữ bên trái, ảnh bên phải */}
          <Grid item xs={12} md={7}>
            <Typography variant="h2" sx={statisticsStyles.mainTitle}>
              English made simple — learn smarter, speak better, and reach your goals faster.
            </Typography>
          </Grid>
          <Grid item xs={12} md={5} sx={{ textAlign: { xs: 'center', md: 'right' } }}>
            <Image
              src={StatisticsImage}
              alt="NENS"
              style={{ width: '140px', height: 'auto', maxWidth: '100%' }}
            />
          </Grid>

          {/* Hàng thứ hai: dãy số liệu và mô tả nhỏ */}
          <Grid item xs={12}>
            <Grid container spacing={2} alignItems="flex-end">
              <Grid item xs={6} md={2}>
                <Typography variant="h3" sx={statisticsStyles.statNumber}>
                  500+
                </Typography>
                <Typography variant="body2" sx={statisticsStyles.statLabel}>
                  Students Reached
                </Typography>
              </Grid>
              <Grid item xs={6} md={2}>
                <Typography variant="h3" sx={statisticsStyles.statNumber}>
                  100+
                </Typography>
                <Typography variant="body2" sx={statisticsStyles.statLabel}>
                  Teacher Reached
                </Typography>
              </Grid>
              <Grid item xs={6} md={2}>
                <Typography variant="h3" sx={statisticsStyles.statNumber}>
                  236
                </Typography>
                <Typography variant="body2" sx={statisticsStyles.statLabel}>
                  Exams
                </Typography>
              </Grid>
              <Grid
                item
                xs={12}
                md={6}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: { xs: 'flex-start', md: 'flex-end' },
                }}
              >
                <Typography variant="body2" sx={statisticsStyles.description}>
                  Discover interactive lessons, fun activities, and real-world conversations that
                  make English learning exciting at every level.
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
