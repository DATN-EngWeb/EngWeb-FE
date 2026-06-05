import React, { Suspense } from 'react';
import Box from '@mui/material/Box';
import Header from '../../components/Home/Header';
import HeroSection from '../../components/Home/HeroSection';
//import TestReleases from '../../components/Home/TestReleases';
import Statistics from '../../components/Home/Statistics';
import WhatMakesUsDifferent from '../../components/Home/WhatMakesUsDifferent';
import Testimonials from '../../components/Home/Testimonials';
import ContactForm from '../../components/Home/ContactForm';
import Footer from '../../components/Home/Footer';

export default function Home() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      <Suspense fallback={null}>
        <Header />
      </Suspense>

      {/* main content grows to fill space → footer always at bottom */}
      <Box component="main" sx={{ flex: 1 }}>
        <HeroSection />
        <Statistics />
        <WhatMakesUsDifferent />
        <Testimonials />
        <ContactForm />
      </Box>

      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </Box>
  );
}
