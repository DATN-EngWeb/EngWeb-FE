import React from 'react';
import { Box, Container, Typography, Grid, Card, CardContent } from '@mui/material';

const testData = [
  { title: 'ETS 2024', color: 'secondary.main', icon: '📊' },
  { title: 'A MEMORABLE EXPERIENCE', color: 'primary.main', icon: '💭' },
  { title: 'Cambridge IELTS 20', color: 'success.main', icon: '📚' },
  { title: 'A1 Test Exam', color: 'warning.main', icon: '🎯' },
];

export default function TestReleases() {
  return (
    <Box sx={{ py: 6, backgroundColor: 'background.paper' }}>
      <Container maxWidth="lg">
        <Typography
          variant="h2"
          sx={{
            color: 'primary.main',
            mb: 4,
            fontSize: { xs: '1.8rem', md: '2rem' },
          }}
        >
          Latest test releases:
        </Typography>
        <Grid container spacing={3}>
          {testData.map((test, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  backgroundColor: test.color,
                  color: 'white',
                  height: '100%',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    transition: 'transform 0.3s ease',
                  },
                }}
              >
                <CardContent sx={{ p: 3, position: 'relative' }}>
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      fontSize: '2rem',
                      opacity: 0.3,
                    }}
                  >
                    {test.icon}
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 'bold',
                      mb: 2,
                      fontSize: '1.2rem',
                    }}
                  >
                    {test.title}
                  </Typography>
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 10,
                      left: 10,
                      width: 30,
                      height: 30,
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      borderRadius: '50%',
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
