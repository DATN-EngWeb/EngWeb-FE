import React from 'react';
import Link from 'next/link';
import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';
import Logo from '../assets/logo.png';
import Image from 'next/image';

export default function Header() {
  return (
    <AppBar position="static" sx={{ backgroundColor: 'background.default', color: 'text.primary' }}>
      <Container maxWidth="lg">
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Image src={Logo} alt="NENS" width={32} height={24} />
          </Link>

          {/* Navigation */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 3 }}>
            <Link href="/reading" style={{ textDecoration: 'none' }}>
              <Button
                color="inherit"
                sx={{
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '0.9rem',
                }}
              >
                Reading
              </Button>
            </Link>
            <Link href="/listening" style={{ textDecoration: 'none' }}>
              <Button
                color="inherit"
                sx={{
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '0.9rem',
                }}
              >
                Listening
              </Button>
            </Link>
            <Link href="/writing" style={{ textDecoration: 'none' }}>
              <Button
                color="inherit"
                sx={{
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '0.9rem',
                }}
              >
                Writing
              </Button>
            </Link>
            <Link href="/speaking" style={{ textDecoration: 'none' }}>
              <Button
                color="inherit"
                sx={{
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '0.9rem',
                }}
              >
                Speaking
              </Button>
            </Link>
          </Box>

          {/* Buttons */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              sx={{
                backgroundColor: '#F5F5DC',
                color: 'text.primary',
                borderColor: 'transparent',
                '&:hover': {
                  backgroundColor: '#E6E6D4',
                },
              }}
            >
              Register
            </Button>
            <Button
              variant="contained"
              sx={{
                backgroundColor: 'primary.main',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
              }}
            >
              Login
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
