import React from 'react';
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
