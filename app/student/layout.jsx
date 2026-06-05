'use strict';

'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Header from '../../components/Home/Header';
import Footer from '../../components/Home/Footer';
import AIAssistantWidget from '../../components/Student/AIAssistantWidget';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';

export default function StudentLayout({ children }) {
  const pathname = usePathname();
  const [isTestPage, setIsTestPage] = useState(false);
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  useEffect(() => {
    if (pathname) {
      setIsTestPage(
        pathname.includes('/student/writing/') ||
          pathname.includes('/student/listening/') ||
          pathname.includes('/student/speaking/') ||
          pathname.includes('/student/reading/'),
      );
    }
  }, [pathname]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      <Suspense fallback={null}>
        <Header />
      </Suspense>
      <Box component="main" sx={{ flex: 1 }}>
        {children}
      </Box>
      {!isAuthLoading && isAuthenticated && <AIAssistantWidget />}
      <Suspense fallback={null}>{!isTestPage && <Footer />}</Suspense>
    </Box>
  );
}
