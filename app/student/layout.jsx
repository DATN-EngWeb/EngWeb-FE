'use strict';

'use client';

import React, { Suspense } from 'react';
import Header from '../../components/Home/Header';
import Footer from '../../components/Home/Footer';
import { usePathname } from 'next/navigation';

export default function StudentLayout({ children }) {
  const pathname = usePathname();

  // Hide footer on test pages to allow full-screen experience and prevent scrolling
  const isTestPage =
    pathname?.includes('/student/writing/') ||
    pathname?.includes('/student/listening/') ||
    pathname?.includes('/student/speaking/') ||
    pathname?.includes('/student/reading/');

  return (
    <>
      <Suspense fallback={null}>
        <Header />
      </Suspense>
      <main style={{ minHeight: isTestPage ? 'auto' : '60vh' }}>{children}</main>
      <Suspense fallback={null}>{!isTestPage && <Footer />}</Suspense>
    </>
  );
}
