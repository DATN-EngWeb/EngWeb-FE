import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function About() {
  return (
    <>
      <Header />
      <Box sx={{ py: 8, minHeight: '80vh' }}>
        <Container maxWidth="lg">
          <Typography variant="h1" sx={{ mb: 4, textAlign: 'center' }}>
            About NENS
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, fontSize: '1.2rem', lineHeight: 1.8 }}>
            NENS (No English No Success) is a comprehensive English learning platform designed to
            help students of all levels improve their English skills through interactive lessons,
            personalized feedback, and real-world practice.
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, fontSize: '1.2rem', lineHeight: 1.8 }}>
            Our mission is to make English learning accessible, engaging, and effective for
            everyone, from beginners taking their first steps to advanced learners preparing for
            international certifications.
          </Typography>
          <Typography variant="body1" sx={{ fontSize: '1.2rem', lineHeight: 1.8 }}>
            With over 500+ students reached, 100+ qualified teachers, and 236+ different exam types,
            we are committed to providing the highest quality English education experience.
          </Typography>
        </Container>
      </Box>
      <Footer />
    </>
  );
}
