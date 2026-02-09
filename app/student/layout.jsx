'use client';

import React from 'react';
import Header from '../../components/Home/Header';
import Footer from '../../components/Home/Footer';

export default function StudentLayout({ children }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}
