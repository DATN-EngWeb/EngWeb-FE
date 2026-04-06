'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Header from '../../components/TeacherHome/Header';
import Footer from '../../components/TeacherHome/Footer';

export default function TeacherLayout({ children }) {
  const pathname = usePathname();
  const isPreviewPage = pathname?.includes('/reading/preview');
  const hideFooter = pathname.includes('/upload-test/') || pathname.includes('/update-test/');

  return (
    <>
      <Header />
      <main style={{ minHeight: isPreviewPage ? '100vh' : '60vh' }}>{children}</main>
      {!isPreviewPage && !hideFooter && <Footer />}
    </>
  );
}
