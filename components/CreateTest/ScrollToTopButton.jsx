'use client';

import { Box, IconButton } from '@mui/material';
import { KeyboardArrowUp } from '@mui/icons-material';
import { useEffect, useState } from 'react';

export default function ScrollToTopButton() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleWindowScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleWindowScroll);
    handleWindowScroll();

    return () => {
      window.removeEventListener('scroll', handleWindowScroll);
    };
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        right: { xs: 16, md: 24 },
        bottom: { xs: 20, md: 28 },
        zIndex: (theme) => theme.zIndex.speedDial,
        opacity: showScrollTop ? 1 : 0,
        transform: showScrollTop ? 'translateY(0)' : 'translateY(12px)',
        pointerEvents: showScrollTop ? 'auto' : 'none',
        transition: 'opacity 0.2s ease, transform 0.2s ease',
      }}
    >
      <IconButton
        onClick={handleScrollToTop}
        sx={{
          bgcolor: 'yellow.main',
          color: 'primary.main',
          boxShadow: 3,
          width: { xs: 46, md: 54 },
          height: { xs: 46, md: 54 },
          '&:hover': {
            bgcolor: 'warning.dark',
          },
        }}
      >
        <KeyboardArrowUp sx={{ fontSize: { xs: 30, md: 36 } }} />
      </IconButton>
    </Box>
  );
}
