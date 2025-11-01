import React from 'react';
import { Box, Container, Typography, Button } from '@mui/material';
import Image from 'next/image';
import HomeImage from '../assets/home.png';
import { heroSectionStyles } from '../styles/HeroSectionStyles';

export default function HeroSection() {
  return (
    <Box sx={heroSectionStyles.mainContainer}>
      <Container maxWidth="lg">
        <Box sx={heroSectionStyles.mainContentContainer}>
          <Box sx={heroSectionStyles.flexBox}>
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
          </Box>
          <Box sx={heroSectionStyles.flexBox}>
            <Box sx={heroSectionStyles.imageContainer}>
              <Image src={HomeImage} alt="NENS" style={heroSectionStyles.heroImageStyle} />
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
