import React from 'react';
import { Box, Container, Typography, Grid, Paper } from '@mui/material';
import Image from 'next/image';
import StatisticsImage from '../assets/statistic.png';
import { statisticsStyles } from '../styles/StatisticsStyles';

const stats = [
  { number: '500+', label: 'Students Reached', color: 'secondary.main' },
  { number: '100+', label: 'Teacher Reached', color: 'primary.main' },
  { number: '236', label: 'Exams', color: 'secondary.main' },
];

export default function Statistics() {
  return (
    <Box sx={statisticsStyles.mainContainer}>
      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h2" sx={statisticsStyles.mainTitle}>
              English made simple - learn smarter, speak better, and reach your goals faster.
            </Typography>
            <Grid container spacing={4} sx={statisticsStyles.statsContainer}>
              {stats.map((stat, index) => (
                <Grid item xs={4} key={index}>
                  <Box sx={statisticsStyles.statBox}>
                    <Typography
                      variant="h3"
                      sx={{
                        ...statisticsStyles.statNumber,
                        color: stat.color,
                      }}
                    >
                      {stat.number}
                    </Typography>
                    <Typography variant="body2" sx={statisticsStyles.statLabel}>
                      {stat.label}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
            <Typography variant="body1" sx={statisticsStyles.description}>
              Discover interactive lessons, fun activities, and real-world conversations that make
              English learning exciting at every level.
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={statisticsStyles.circularPaper}>
              👩
            </Paper>
            {/* Decorative shapes */}
            <Image src={StatisticsImage} alt="NENS" width={32} height={24} />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
