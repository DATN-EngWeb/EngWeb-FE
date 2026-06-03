'use client';

import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  Container,
  Avatar,
  Typography,
  Badge,
  Tooltip,
  Drawer,
  IconButton,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
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
  userPopupBackdropStyles,
  userPopupContainerStyles,
  userPopupHeaderStyles,
  userPopupAvatarNameBoxStyles,
  userPopupAvatarWrapperStyles,
  userPopupUsernameStyles,
  userPopupLevelStyles,
  userPopupMenuItemStyles,
  userPopupMenuItemLogoutStyles,
} from '../../styles/Home/HeaderStyles';
import { useAuth } from '../../hooks/useAuth';
import { logout as logoutAPI } from '../../api/accounts';
import NotificationBell from '../Notifications/NotificationBell';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';

// Icon components (copied from student header for consistent UI)
const ProfileIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const LogoutIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

export default function TeacherHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, logout: logoutHook } = useAuth(null);
  const [popupOpen, setPopupOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userAvatar, setUserAvatar] = useState(null);
  const [userName, setUserName] = useState(null);
  const avatarWrapperRef = useRef(null);
  const popupRef = useRef(null);
  const usernameRef = useRef(null);
  const [isNameOverflow, setIsNameOverflow] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const latestAvatar = localStorage.getItem('avatar');
    setUserAvatar(latestAvatar || user?.avatar || null);
    const username = localStorage.getItem('username') || user?.username || 'Teacher';
    setUserName(username);
  }, [user]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const syncAuth = () => {
      const latestAvatar = localStorage.getItem('avatar');
      setUserAvatar(latestAvatar || null);
      const username = localStorage.getItem('username') || user?.username || 'Teacher';
      setUserName(username);
    };
    window.addEventListener('auth-user-updated', syncAuth);
    window.addEventListener('storage', syncAuth);
    return () => {
      window.removeEventListener('auth-user-updated', syncAuth);
      window.removeEventListener('storage', syncAuth);
    };
  }, [user]);

  useLayoutEffect(() => {
    const el = usernameRef.current;
    if (!el) return;
    const checkOverflow = () => {
      setIsNameOverflow(el.scrollWidth > el.clientWidth);
    };
    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [userName]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!popupOpen) return;
      const target = event.target;
      // Close when click is outside popup container and outside avatar toggle
      if (
        popupRef.current &&
        !popupRef.current.contains(target) &&
        avatarWrapperRef.current &&
        !avatarWrapperRef.current.contains(target)
      ) {
        setPopupOpen(false);
      }
    };

    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        setPopupOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);

  const handleMenuOpen = () => {
    setPopupOpen((prev) => !prev);
  };

  const handleMenuClose = () => {
    setPopupOpen(false);
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
    { label: 'Forum', href: '/teacher/forum' },
  ];

  const avatarMenuContent = (
    <>
      <div style={userPopupHeaderStyles}>
        <div style={userPopupAvatarNameBoxStyles}>
          <div style={userPopupAvatarWrapperStyles}>
            <Avatar
              src={userAvatar || undefined}
              alt={userName || 'User'}
              sx={{ width: '100%', height: '100%' }}
            >
              {userName?.[0]?.toUpperCase() || 'U'}
            </Avatar>
          </div>
          <div>
            {isNameOverflow ? (
              <Tooltip title={userName || 'User'}>
                <div
                  ref={usernameRef}
                  style={{
                    ...userPopupUsernameStyles,
                    maxWidth: 160,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontFamily:
                      'Poppins, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial, sans-serif',
                  }}
                >
                  {userName || 'User'}
                </div>
              </Tooltip>
            ) : (
              <div
                ref={usernameRef}
                style={{
                  ...userPopupUsernameStyles,
                  maxWidth: 160,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {userName || 'User'}
              </div>
            )}
            <div style={userPopupLevelStyles}>Teacher account</div>
          </div>
        </div>
      </div>

      <Box sx={{ padding: '8px 12px' }}>
        <Box
          onClick={() => {
            handleMenuClose();
            router.push('/teacher/profile');
          }}
          sx={{
            ...userPopupMenuItemStyles,
            alignItems: 'center',
            cursor: 'pointer',
            display: 'flex',
            gap: 1,
            color: 'text.primary',
            '&:hover': {
              bgcolor: 'rgba(25,118,210,0.06)',
              color: 'primary.main',
              borderRadius: 1,
            },
          }}
        >
          <ProfileIcon />
          <Typography sx={{ fontWeight: 600 }}>Profile</Typography>
        </Box>

        <Box
          onClick={handleLogout}
          sx={{
            ...userPopupMenuItemLogoutStyles,
            alignItems: 'center',
            cursor: 'pointer',
            display: 'flex',
            gap: 1,
            color: 'error.main',
            '&:hover': {
              bgcolor: 'rgba(211,47,47,0.06)',
              color: 'error.main',
              borderRadius: 1,
            },
          }}
        >
          <LogoutIcon />
          <Typography sx={{ fontWeight: 600 }}>Logout</Typography>
        </Box>
      </Box>
    </>
  );

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
      <Container disableGutters maxWidth="lg">
        <Toolbar sx={{ ...toolbarStyles, minHeight: 'auto', py: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            <Link href="/teacher" style={logoLinkStyles}>
              <Image src={Logo} alt="NENS" width={32} height={24} />
            </Link>
            <IconButton
              sx={{
                display: { xs: 'flex', md: 'none' },
                color: 'primary.main',
                p: 0,
                ml: -2,
              }}
              onClick={() => setMobileMenuOpen(true)}
            >
              <MenuIcon />
            </IconButton>
            <Box sx={navBoxStyles}>
              {menuItems.map((item) => {
                const isActive =
                  item.href === '/teacher'
                    ? pathname === '/teacher'
                    : pathname?.includes(item.href);
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
          </Box>

          <Box sx={{ ...actionBoxStyles, justifyContent: 'flex-end' }}>
            {isAuthenticated && user ? (
              <>
                <NotificationBell />
                <Box ref={avatarWrapperRef} sx={{ position: 'relative', display: 'flex' }}>
                  <Box
                    id="user-menu-button"
                    role="button"
                    tabIndex={0}
                    aria-label="User menu"
                    aria-haspopup="true"
                    aria-expanded={popupOpen}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleMenuOpen();
                      }
                    }}
                    onClick={handleMenuOpen}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      cursor: 'pointer',
                    }}
                  >
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      badgeContent={
                        <Box
                          sx={{
                            backgroundColor: 'background.default',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 16,
                            height: 16,
                          }}
                        >
                          <ExpandMoreIcon sx={{ fontSize: 14, color: 'primary.main' }} />
                        </Box>
                      }
                    >
                      <Avatar
                        src={userAvatar || undefined}
                        alt={userName || 'User'}
                        sx={{
                          width: 40,
                          height: 40,
                          border: '2px solid',
                          borderColor: popupOpen ? 'warning.main' : 'secondary.main',
                          transition: 'border-color 0.2s',
                          fontFamily:
                            'Poppins, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial, sans-serif',
                        }}
                      >
                        {userName?.[0]?.toUpperCase() || 'U'}
                      </Avatar>
                    </Badge>
                  </Box>

                  {popupOpen && (
                    <>
                      {isMobile ? (
                        <Drawer
                          anchor="bottom"
                          open={popupOpen}
                          onClose={handleMenuClose}
                          sx={{
                            '& .MuiDrawer-paper': {
                              borderTopLeftRadius: 12,
                              borderTopRightRadius: 12,
                            },
                          }}
                        >
                          <Box sx={{ px: 2, pt: 2, pb: 3 }}>{avatarMenuContent}</Box>
                        </Drawer>
                      ) : (
                        <>
                          <div style={userPopupBackdropStyles} onClick={handleMenuClose} />
                          <div style={{ ...userPopupContainerStyles, width: 260 }} ref={popupRef}>
                            {avatarMenuContent}
                          </div>
                        </>
                      )}
                    </>
                  )}
                </Box>
              </>
            ) : null}
          </Box>
        </Toolbar>
      </Container>

      {/* Mobile Menu Drawer */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        variant="temporary"
        sx={{
          '& .MuiBackdrop-root': {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          },
          '& .MuiDrawer-paper': {
            width: '100%',
            maxWidth: '280px',
            backgroundColor: 'background.default',
            zIndex: 1301,
          },
        }}
      >
        <Box sx={{ padding: '16px', display: 'flex', justifyContent: 'flex-end' }}>
          <IconButton onClick={() => setMobileMenuOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Box sx={{ padding: '8px 16px' }}>
          {menuItems.map((item) => {
            const isActive =
              item.href === '/teacher' ? pathname === '/teacher' : pathname?.includes(item.href);
            return (
              <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
                <Button
                  fullWidth
                  onClick={() => setMobileMenuOpen(false)}
                  sx={{
                    justifyContent: 'flex-start',
                    color: isActive ? 'secondary.main' : 'primary.main',
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '1rem',
                    padding: '12px 16px',
                    marginBottom: '8px',
                    '&:hover': {
                      backgroundColor: 'rgba(25,118,210,0.06)',
                      color: 'secondary.main',
                    },
                  }}
                >
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </Box>
      </Drawer>
    </AppBar>
  );
}
