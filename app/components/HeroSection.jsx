import React from 'react';
import { Box, Container, Typography, Button, Grid, Paper } from '@mui/material';
import Image from 'next/image';
import HomeImage from '../assets/home.png';
import { heroSectionStyles } from '../styles/HeroSectionStyles';

export default function HeroSection() {
  return (
    <Box sx={heroSectionStyles.mainContainer}>
      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h1" sx={heroSectionStyles.mainTitle}>
              Learn English, Grow Confidently
            </Typography>
            <Typography variant="body1" sx={heroSectionStyles.description}>
              Whether you're just starting or aiming for certifications, our step-by-step lessons
              and exams will help you speak English naturally and confidently at every level.
            </Typography>
            <Button variant="contained" size="large" sx={heroSectionStyles.startNowButton}>
              Start Now ▶
            </Button>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={heroSectionStyles.imageContainer}>
              <Paper elevation={3} sx={heroSectionStyles.circularPaper}>
                {/* Sound wave icon */}

                <Image src={HomeImage} alt="NENS" width={32} height={24} />
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
