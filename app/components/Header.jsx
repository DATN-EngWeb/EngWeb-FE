import React from 'react';
import Link from 'next/link';
import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';
import Logo from '../assets/logo.png';
import Image from 'next/image';
import {
  appBarStyles,
  toolbarStyles,
  navBoxStyles,
  navButtonStyles,
  actionBoxStyles,
  registerButtonStyles,
  loginButtonStyles,
  logoLinkStyles,
  navLinkStyles,
} from '../styles/HeaderStyles';

export default function Header() {
  return (
    <AppBar position="static" sx={appBarStyles}>
      <Container maxWidth="lg">
        <Toolbar sx={toolbarStyles}>
          <Box sx={navBoxStyles}>
            <Link href="/" style={logoLinkStyles}>
              <Image src={Logo} alt="NENS" width={32} height={24} />
            </Link>
            <Link href="/reading" style={navLinkStyles}>
              <Button color="inherit" sx={navButtonStyles}>
                Reading
              </Button>
            </Link>
            <Link href="/listening" style={navLinkStyles}>
              <Button color="inherit" sx={navButtonStyles}>
                Listening
              </Button>
            </Link>
            <Link href="/writing" style={navLinkStyles}>
              <Button color="inherit" sx={navButtonStyles}>
                Writing
              </Button>
            </Link>
            <Link href="/speaking" style={navLinkStyles}>
              <Button color="inherit" sx={navButtonStyles}>
                Speaking
              </Button>
            </Link>
          </Box>

          <Box sx={actionBoxStyles}>
            <Button variant={registerButtonStyles.variant} sx={registerButtonStyles.sx}>
              Register
            </Button>
            <Button variant={loginButtonStyles.variant} sx={loginButtonStyles.sx}>
              Login
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
