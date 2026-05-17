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
import { logout as logoutAPI, getTeacherProfile } from '../../api/accounts';
import NotificationBell from '../Notifications/NotificationBell';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

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
  const [userAvatar, setUserAvatar] = useState(null);
  const [userFullName, setUserFullName] = useState(null);
  const [teacherProfile, setTeacherProfile] = useState(null);
  const avatarWrapperRef = useRef(null);
  const popupRef = useRef(null);
  const usernameRef = useRef(null);
  const [isNameOverflow, setIsNameOverflow] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const latestAvatar = localStorage.getItem('avatar_url') || localStorage.getItem('avatar');
    setUserAvatar(latestAvatar || user?.avatar || null);
    setUserFullName(user?.full_name || localStorage.getItem('full_name') || 'Teacher');
    // synced from auth/localStorage
  }, [user]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const syncAuth = () => {
      const latestAvatar = localStorage.getItem('avatar_url') || localStorage.getItem('avatar');
      setUserAvatar(latestAvatar || null);
      const latestFull = localStorage.getItem('full_name');
      setUserFullName(latestFull || user?.full_name || 'Teacher');
    };
    window.addEventListener('auth-user-updated', syncAuth);
    window.addEventListener('storage', syncAuth);
    return () => {
      window.removeEventListener('auth-user-updated', syncAuth);
      window.removeEventListener('storage', syncAuth);
    };
  }, [user]);

  // Fetch teacher profile when `user` changes, like student header does
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user || user.role !== 'T' || !user.id) return;
      try {
        const profile = await getTeacherProfile(user.id);
        setTeacherProfile(profile || null);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to fetch teacher profile:', err);
      }
    };

    fetchProfile();
  }, [user]);

  // When teacherProfile updates, sync avatar and fullname into header state
  useEffect(() => {
    if (!teacherProfile) return;
    const avatarFromProfile = teacherProfile?.avatar_url || teacherProfile?.avatar || null;
    const fullFromProfile = teacherProfile?.full_name || teacherProfile?.fullName || null;
    if (avatarFromProfile) {
      setUserAvatar(avatarFromProfile);
    }
    if (fullFromProfile) {
      setUserFullName(fullFromProfile);
    }
  }, [teacherProfile]);

  useLayoutEffect(() => {
    const el = usernameRef.current;
    if (!el) return;
    const checkOverflow = () => {
      setIsNameOverflow(el.scrollWidth > el.clientWidth);
    };
    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [user?.full_name, userFullName]);

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
    const next = !popupOpen;
    if (!popupOpen) {
      // opening: fetch latest profile to ensure fullname/avatar are up-to-date
      (async () => {
        if (typeof window === 'undefined') return;
        if (!user?.id || user?.role !== 'T') return;
        try {
          const profile = await getTeacherProfile(user.id);
          const avatarFromProfile = profile?.avatar_url || profile?.avatar || null;
          const fullFromProfile = profile?.full_name || profile?.fullName || null;
          if (avatarFromProfile) {
            setUserAvatar(avatarFromProfile);
            localStorage.setItem('avatar', avatarFromProfile);
          }
          if (fullFromProfile) {
            setUserFullName(fullFromProfile);
            localStorage.setItem('full_name', fullFromProfile);
          }
          try {
            // eslint-disable-next-line no-undef
            window.dispatchEvent(new Event('auth-user-updated'));
          } catch (e) {
            // ignore
          }
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('Failed to fetch teacher profile on popup open:', err);
        }
      })();
    }
    setPopupOpen(next);
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
                        alt={userFullName || 'User'}
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
                        {userFullName?.[0]?.toUpperCase() || 'U'}
                      </Avatar>
                    </Badge>
                  </Box>

                  {popupOpen && (
                    <>
                      <div style={userPopupBackdropStyles} onClick={handleMenuClose} />
                      <div style={{ ...userPopupContainerStyles, width: 260 }} ref={popupRef}>
                        <div style={userPopupHeaderStyles}>
                          <div style={userPopupAvatarNameBoxStyles}>
                            <div style={userPopupAvatarWrapperStyles}>
                              <Avatar
                                src={userAvatar || undefined}
                                alt={userFullName || 'User'}
                                sx={{ width: '100%', height: '100%' }}
                              >
                                {userFullName?.[0]?.toUpperCase() || 'U'}
                              </Avatar>
                            </div>
                            <div>
                              {isNameOverflow ? (
                                <Tooltip title={userFullName || 'User'}>
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
                                    {userFullName || 'User'}
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
                                  {userFullName || 'User'}
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
                      </div>
                    </>
                  )}
                </Box>
              </>
            ) : null}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
