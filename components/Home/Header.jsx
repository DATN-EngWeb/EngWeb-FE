'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  Container,
  Avatar,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
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
import { useAuth } from '../../hooks/useAuth';
import { logout as logoutAPI } from '../../api/accounts';
import AnimatedStreakBadge from '../Streak/animatedStreakBadge';
import StreakBadge from '../Streak/streakBadge';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, logout: logoutHook } = useAuth(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [userAvatar, setUserAvatar] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionType, setActionType] = useState('register');

  useEffect(() => {
    if (user?.avatar && typeof window !== 'undefined') {
      setUserAvatar(user.avatar);
    }
  }, [user]);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleOpenModal = (type) => {
    setActionType(type);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleSelectRole = (role) => {
    if (actionType === 'login') {
      router.push(`/login?role=${role}`);
    } else {
      router.push(`/register?role=${role}`);
    }
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        const button = document.getElementById('user-menu-button');
        if (button) {
          button.focus();
        }
      }, 0);
    }
  };

  const handleLogout = async () => {
    handleMenuClose();
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      const accessToken = localStorage.getItem('accessToken');
      if (refreshToken && accessToken) {
        await logoutAPI(refreshToken, accessToken);
      }
    } catch (err) {
      console.error('Logout API error:', err);
    } finally {
      logoutHook();
      router.push('/');
    }
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
              <Link href="/student/reading" style={navLinkStyles}>
                <Button
                  color="inherit"
                  sx={{
                    ...navButtonStyles,
                    borderRadius: 0,
                    backgroundColor: 'transparent',
                    color: pathname?.includes('/reading') ? 'secondary.main' : 'primary.main',
                    fontWeight: pathname?.includes('/reading') ? 700 : 500,
                    borderBottom: '3px solid',
                    borderColor: pathname?.includes('/reading') ? 'secondary.main' : 'transparent',
                    px: 1,
                    pt: 1.5,
                    pb: 0.5,
                    marginX: '15px',
                    transition: 'all 0.2s',
                    '&:hover': {
                      backgroundColor: pathname?.includes('/reading')
                        ? 'secondary.dark'
                        : 'action.hover',
                    },
                  }}
                >
                  Reading
                </Button>
              </Link>
              <Link href="/student/listening" style={navLinkStyles}>
                <Button
                  color="inherit"
                  sx={{
                    ...navButtonStyles,
                    backgroundColor: pathname?.includes('/listening')
                      ? 'secondary.main'
                      : 'transparent',
                    px: 1,
                    pt: 1.5,
                    pb: 0.5,
                    marginX: '15px',
                    transition: 'all 0.2s',
                    '&:hover': {
                      backgroundColor: pathname?.includes('/listening')
                        ? 'secondary.dark'
                        : 'action.hover',
                    },
                  }}
                >
                  Listening
                </Button>
              </Link>
              <Link href="/student/writing" style={navLinkStyles}>
                <Button
                  color="inherit"
                  sx={{
                    ...navButtonStyles,
                    borderRadius: 0,
                    backgroundColor: 'transparent',
                    color: pathname?.includes('/writing') ? 'secondary.main' : 'primary.main',
                    fontWeight: pathname?.includes('/writing') ? 700 : 500,
                    borderBottom: '3px solid',
                    borderColor: pathname?.includes('/writing') ? 'secondary.main' : 'transparent',
                    px: 1,
                    pt: 1.5,
                    pb: 0.5,
                    marginX: '15px',
                    transition: 'all 0.2s',
                    '&:hover': {
                      backgroundColor: pathname?.includes('/writing')
                        ? 'secondary.dark'
                        : 'action.hover',
                    },
                  }}
                >
                  Writing
                </Button>
              </Link>
              <Link href="/student/speaking" style={navLinkStyles}>
                <Button
                  color="inherit"
                  sx={{
                    ...navButtonStyles,
                    borderRadius: 0,
                    backgroundColor: 'transparent',
                    color: pathname?.includes('/speaking') ? 'secondary.main' : 'primary.main',
                    fontWeight: pathname?.includes('/speaking') ? 700 : 500,
                    borderBottom: '3px solid',
                    borderColor: pathname?.includes('/speaking') ? 'secondary.main' : 'transparent',
                    px: 1,
                    pt: 1.5,
                    pb: 0.5,
                    marginX: '15px',
                    transition: 'all 0.2s',
                    '&:hover': {
                      backgroundColor: pathname?.includes('/speaking')
                        ? 'secondary.dark'
                        : 'action.hover',
                    },
                  }}
                >
                  Speaking
                </Button>
              </Link>
            </Box>

            <Box sx={actionBoxStyles}>
              {isAuthenticated && user ? (
                <>
                  <AnimatedStreakBadge />
                  <StreakBadge />
                  <Box
                    id="user-menu-button"
                    role="button"
                    tabIndex={0}
                    aria-label="User menu"
                    aria-haspopup="true"
                    aria-expanded={Boolean(anchorEl)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleMenuOpen(e);
                      }
                    }}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      cursor: 'pointer',
                    }}
                    onClick={handleMenuOpen}
                  >
                    <Avatar
                      src={userAvatar || undefined}
                      alt={user.username || 'User'}
                      sx={{ width: 32, height: 32 }}
                    >
                      {user.username?.[0]?.toUpperCase() || 'U'}
                    </Avatar>
                    <Typography
                      sx={{
                        color: 'primary.dark',
                        fontWeight: 600,
                        display: { xs: 'none', sm: 'block' },
                        maxWidth: '150px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {user.username || 'User'}
                    </Typography>
                  </Box>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    onClick={handleMenuClose}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    MenuListProps={{
                      'aria-labelledby': 'user-menu-button',
                    }}
                  >
                    <MenuItem
                      onClick={() => {
                        handleMenuClose();
                        router.push(user?.role === 'T' ? '/teacher/profile' : '/student/profile');
                      }}
                    >
                      <Typography>Profile</Typography>
                    </MenuItem>
                    {user?.role !== 'T' && (
                      <MenuItem
                        onClick={() => {
                          handleMenuClose();
                          router.push('/student/dashboard');
                        }}
                      >
                        <Typography>Dashboard</Typography>
                      </MenuItem>
                    )}
                    <MenuItem onClick={handleLogout}>
                      <Typography color="error">Logout</Typography>
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <>
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
                </>
              )}
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
