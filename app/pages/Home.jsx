import React from 'react';
import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
//import TestReleases from '../components/TestReleases';
import Statistics from '../components/Statistics';
import WhatMakesUsDifferent from '../components/WhatMakesUsDifferent';
import Testimonials from '../components/Testimonials';
import ContactForm from '../components/ContactForm';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <>
      <Header />
      <HeroSection />
      <Statistics />
      <WhatMakesUsDifferent />
      <Testimonials />
      <ContactForm />
      <Footer />
    </>
  );
}
