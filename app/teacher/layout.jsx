'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Header from '../../components/TeacherHome/Header';
import Footer from '../../components/Home/Footer';

export default function TeacherLayout({ children }) {
  const pathname = usePathname();
  const [isPreviewPage, setIsPreviewPage] = React.useState(false);
  const [hideFooter, setHideFooter] = React.useState(false);

  React.useEffect(() => {
    if (pathname) {
      setIsPreviewPage(pathname.includes('/reading/preview'));
      setHideFooter(pathname.includes('/upload-test/') || pathname.includes('/update-test/'));
    }
  }, [pathname]);

  return (
    <>
      <Header />
      <main style={{ minHeight: isPreviewPage ? '100vh' : '60vh' }}>{children}</main>
      {!isPreviewPage && !hideFooter && <Footer />}
    </>
  );
}
