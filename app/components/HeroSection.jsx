import React from 'react';
import { Box, Container, Typography, Button, Grid, Paper } from '@mui/material';
import Image from 'next/image';
import HomeImage from '../assets/home.png';
import { heroSectionStyles } from '../styles/HeroSectionStyles';

export default function HeroSection() {
  return (
    <Box sx={heroSectionStyles.mainContainer}>
      <Container maxWidth="lg" disableGutters>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={4}>
            <Box sx={heroSectionStyles.titleContainer}>
              <Typography variant="h1" sx={heroSectionStyles.mainTitle}>
                Learn English, Grow Confidently
              </Typography>
              <Typography variant="body1" sx={heroSectionStyles.description}>
                Whether you're just starting or aiming for certifications, our step-by-step lessons
                and exams will help you speak English naturally and confidently at every level.
              </Typography>
              <Button variant="contained" size="large" sx={heroSectionStyles.startNowButton}>
                Start Now
                <Box component="span" sx={heroSectionStyles.playCircle}>
                  <Box component="span" sx={heroSectionStyles.playTriangle} />
                </Box>
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={8} sx={{ p: 0 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                width: '100%',
                m: 0,
                p: 0,
              }}
            >
              <Image
                src={HomeImage}
                alt="NENS"
                style={{ width: '400px', height: 'auto', maxWidth: 560 }}
              />
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
