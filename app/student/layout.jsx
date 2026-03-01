'use client';

import React from 'react';
import Header from '../../components/Home/Header';

export default function StudentLayout({ children }) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}
