import React from 'react';
import { Box, Container, Typography, Grid, Card, CardContent } from '@mui/material';
import { testReleasesStyles } from '../../styles/Home/TestReleasesStyles';

const testData = [
  { title: 'ETS 2024', color: 'secondary.main', icon: '📊' },
  { title: 'A MEMORABLE EXPERIENCE', color: 'primary.main', icon: '💭' },
  { title: 'Cambridge IELTS 20', color: 'success.main', icon: '📚' },
  { title: 'A1 Test Exam', color: 'warning.main', icon: '🎯' },
];

export default function TestReleases() {
  return (
    <Box sx={testReleasesStyles.mainContainer}>
      <Container maxWidth="lg">
        <Typography variant="h2" sx={testReleasesStyles.title}>
          Latest test releases:
        </Typography>
        <Grid container spacing={3}>
          {testData.map((test, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  ...testReleasesStyles.cardBase,
                  backgroundColor: test.color,
                }}
              >
                <CardContent sx={testReleasesStyles.cardContent}>
                  <Box sx={testReleasesStyles.iconContainer}>{test.icon}</Box>
                  <Typography variant="h6" sx={testReleasesStyles.cardTitle}>
                    {test.title}
                  </Typography>
                  <Box sx={testReleasesStyles.decorativeCircle} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
