'use client';

import React from 'react';
import Header from '../../components/TeacherHome/Header';
import Footer from '../../components/TeacherHome/Footer';

export default function TeacherLayout({ children }) {
  return (
    <>
      <Header />
      <main style={{ minHeight: '60vh' }}>{children}</main>
      <Footer />
    </>
  );
}
