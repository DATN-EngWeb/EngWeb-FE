'use client';

import React from 'react';
import Header from '../../Home/Header';
import Footer from '../../Home/Footer';
import FillBlanksContent from './FillBlanksContent';

const FillBlanksReading = (props) => {
  return (
    <>
      <Header />
      <FillBlanksContent {...props} />
      <Footer />
    </>
  );
};

export default FillBlanksReading;
