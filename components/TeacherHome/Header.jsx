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
  logoLinkStyles,
  navLinkStyles,
} from '../../styles/Home/HeaderStyles';
import { useAuth } from '../../hooks/useAuth';
import { logout as logoutAPI } from '../../api/accounts';

export default function TeacherHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout: logoutHook } = useAuth(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [userAvatar, setUserAvatar] = useState(null);

  useEffect(() => {
    if (user?.avatar && typeof window !== 'undefined') {
      setUserAvatar(user.avatar);
    }
  }, [user]);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
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
      // Continue logout even if API call fails
    } finally {
      logoutHook();
      router.push('/');
    }
  };

  const menuItems = [
    { label: 'My List Test', href: '/teacher' },
    { label: 'List Review Test', href: '/teacher/review-test' },
    { label: 'Upload Test', href: '/teacher/upload-test' },
  ];

  return (
    <AppBar
      position="static"
      sx={{
        ...appBarStyles,
        '@media print': {
          display: 'none',
        },
      }}
    >
      <Container maxWidth="lg">
        <Toolbar sx={toolbarStyles}>
          <Box sx={navBoxStyles}>
            <Link href="/teacher" style={logoLinkStyles}>
              <Image src={Logo} alt="NENS" width={32} height={24} />
            </Link>
            {menuItems.map((item) => {
              const isActive =
                item.href === '/teacher' ? pathname === '/teacher' : pathname?.includes(item.href);
              return (
                <Link key={item.href} href={item.href} style={navLinkStyles}>
                  <Button
                    color="inherit"
                    disableRipple
                    sx={{
                      ...navButtonStyles,
                      backgroundColor: 'transparent',
                      color: isActive ? 'secondary.main' : 'primary.main',
                      borderRadius: 0,
                      borderBottom: isActive ? '3px solid' : 'none',
                      borderColor: isActive ? 'secondary.main' : 'transparent',
                      padding: '8px 4px',
                      marginRight: '50px',
                      fontWeight: isActive ? 700 : 500,
                      '&:hover': {
                        backgroundColor: 'transparent',
                        color: 'secondary.main',
                        borderColor: 'secondary.main',
                      },
                    }}
                  >
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </Box>

          <Box sx={actionBoxStyles}>
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
                alt={user?.username || 'User'}
                sx={{ width: 32, height: 32 }}
              >
                {user?.username?.[0]?.toUpperCase() || 'U'}
              </Avatar>
              <Typography
                sx={{
                  color: 'primary.dark',
                  fontWeight: 600,
                  display: { xs: 'none', sm: 'block' },
                }}
              >
                {user?.username || 'User'}
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
            >
              <MenuItem
                onClick={() => {
                  handleMenuClose();
                  router.push('/teacher/profile');
                }}
              >
                <Typography>Profile</Typography>
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <Typography color="error">Logout</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
