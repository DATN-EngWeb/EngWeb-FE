import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import Image from 'next/image';
import StatisticsImage from '../../assets/statistic.png';
import { statisticsStyles } from '../../styles/Home/StatisticsStyles';

// const stats = [
//   { number: '500+', label: 'Students Reached', color: 'secondary.main' },
//   { number: '100+', label: 'Teacher Reached', color: 'secondary.main' },
//   { number: '236', label: 'Exams', color: 'secondary.main' },
// ];

export default function Statistics() {
  return (
    <Box sx={statisticsStyles.mainContainer}>
      <Container maxWidth="lg">
        <Box sx={statisticsStyles.topRowContainer}>
          <Box sx={statisticsStyles.flexBox}>
            <Typography variant="h2" sx={statisticsStyles.mainTitle}>
              English made simple — learn smarter, speak better, and reach your goals faster.
            </Typography>
          </Box>
          <Box sx={statisticsStyles.imageFlexBox}>
            <Image src={StatisticsImage} alt="NENS" style={statisticsStyles.imageStyle} />
          </Box>
        </Box>

        <Box sx={statisticsStyles.bottomRowContainer}>
          <Box sx={statisticsStyles.statBoxContainer}>
            <Typography variant="h3" sx={statisticsStyles.statNumber}>
              500+
            </Typography>
            <Typography variant="body2" sx={statisticsStyles.statLabel}>
              Students Reached
            </Typography>
          </Box>
          <Box sx={statisticsStyles.statBoxContainer}>
            <Typography variant="h3" sx={statisticsStyles.statNumber}>
              100+
            </Typography>
            <Typography variant="body2" sx={statisticsStyles.statLabel}>
              Teacher Reached
            </Typography>
          </Box>
          <Box sx={statisticsStyles.statBoxContainer}>
            <Typography variant="h3" sx={statisticsStyles.statNumber}>
              236
            </Typography>
            <Typography variant="body2" sx={statisticsStyles.statLabel}>
              Exams
            </Typography>
          </Box>
          <Box sx={statisticsStyles.descriptionContainer}>
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
