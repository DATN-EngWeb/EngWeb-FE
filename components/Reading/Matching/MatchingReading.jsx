'use client';

import React from 'react';
import Header from '../../Home/Header';
import Footer from '../../Home/Footer';
import MatchingContent from './MatchingContent';

const MatchingReading = (props) => {
  return (
    <>
      <Header />
      <MatchingContent {...props} />
      <Footer />
    </>
  );
};

export default MatchingReading;
