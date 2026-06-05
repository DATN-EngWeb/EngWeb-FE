'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Box from '@mui/material/Box';
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
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      <Header />
      <Box component="main" sx={{ flex: 1, minHeight: isPreviewPage ? '100vh' : 'unset' }}>
        {children}
      </Box>
      {!isPreviewPage && !hideFooter && <Footer />}
    </Box>
  );
}
