'use client';

import React from 'react';
import Header from '../../Home/Header';
import Footer from '../../Home/Footer';
import MultiChoiceContent from './MultiChoiceContent';

const MultiChoiceReading = (props) => {
  return (
    <>
      <Header />
      <MultiChoiceContent {...props} />
      <Footer />
    </>
  );
};

export default MultiChoiceReading;
