'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppBar, Toolbar, Button, Box, Container } from '@mui/material';
import Logo from '../../assets/img/logo.png';
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
} from '../../styles/Home/HeaderStyles';
import RoleSelectionModal from '../Auth/RoleSelectionModal';

export default function Header() {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [actionType, setActionType] = useState('login'); // 'login' or 'register'

  const handleOpenModal = (type) => {
    setActionType(type);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleSelectRole = (role) => {
    // Navigate to login or register page with role parameter
    const path = actionType === 'login' ? '/login' : '/register';
    router.push(`${path}?role=${role}`);
  };

  return (
    <>
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
              <Button
                variant={registerButtonStyles.variant}
                sx={registerButtonStyles.sx}
                onClick={() => handleOpenModal('register')}
              >
                Register
              </Button>
              <Button
                variant={loginButtonStyles.variant}
                sx={loginButtonStyles.sx}
                onClick={() => handleOpenModal('login')}
              >
                Login
              </Button>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <RoleSelectionModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSelectRole={handleSelectRole}
        actionType={actionType}
      />
    </>
  );
}
