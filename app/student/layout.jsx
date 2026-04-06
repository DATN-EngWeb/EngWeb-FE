import React, { Suspense } from 'react';
import Header from '../../components/Home/Header';
import Footer from '../../components/Home/Footer';

export default function StudentLayout({ children }) {
  return (
    <>
      <Suspense fallback={null}>
        <Header />
      </Suspense>
      <main style={{ minHeight: '60vh' }}>{children}</main>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </>
  );
}
