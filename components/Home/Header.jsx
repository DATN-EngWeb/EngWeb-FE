'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  registerButtonStyles,
  loginButtonStyles,
  logoLinkStyles,
  navLinkStyles,
  userPopupBackdropStyles,
  userPopupContainerStyles,
  userPopupHeaderStyles,
  userPopupAvatarNameBoxStyles,
  userPopupAvatarWrapperStyles,
  userPopupUsernameStyles,
  userPopupLevelStyles,
  userPopupXpRowStyles,
  userPopupXpLabelStyles,
  userPopupXpValueStyles,
  userPopupXpBarContainerStyles,
  getUserPopupXpBarFillStyles,
  userPopupDividerStyles,
  userPopupMenuContainerStyles,
  userPopupMenuItemStyles,
  userPopupMenuItemLogoutStyles,
  userPopupMenuItemIconStyles,
} from '../../styles/Home/HeaderStyles';
import RoleSelectionModal from '../Auth/RoleSelectionModal';
import { useAuth } from '../../hooks/useAuth';
import { useStreakContext } from '../../context/streakContext';
import { logout as logoutAPI, getStudentProfile } from '../../api/accounts';
import AnimatedStreakBadge from '../Streak/animatedStreakBadge';
import StreakBadge from '../Streak/streakBadge';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import NotificationBell from '../Notifications/NotificationBell';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// Icon components
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

const DashboardIcon = () => (
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
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
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

// User Popup Component
function UserPopup({ user, studentProfile, userAvatar, onClose, onLogout, onNavigate }) {
  const popupRef = useRef(null);

  const isTeacher = user?.role === 'T';

  const displayName =
    (studentProfile && (studentProfile.full_name || studentProfile.fullName)) ||
    user?.full_name ||
    localStorage.getItem('full_name') ||
    user?.username ||
    'User';

  // For students, show level and XP. For teachers, these are not applicable.
  const level = studentProfile?.level?.level_number || 1;
  const levelTitle = studentProfile?.level?.level_title || 'Beginner';
  const currentXP = studentProfile?.cumulative_point || 0;
  const maxXP = studentProfile?.level?.max_xp || 100;

  // AI turns data for students
  const weeklyTurns = studentProfile?.weekly_ai_turn ?? 0;
  const bonusTurns = studentProfile?.bonus_ai_turn ?? 0;

  const xpPercent = Math.min((currentXP / maxXP) * 100, 100);
  const isValidAvatar = userAvatar && userAvatar !== 'null' && userAvatar !== 'undefined';

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        onClose();
      }
    };
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  return (
    <>
      {/* Backdrop */}
      <div style={userPopupBackdropStyles} />

      {/* Popup */}
      <div ref={popupRef} style={userPopupContainerStyles}>
        <style>{`
          @keyframes popupFadeIn {
            from { opacity: 0; transform: translateY(-8px) scale(0.97); }
            to   { opacity: 1; transform: translateY(0) scale(1); }
          }
        `}</style>

        {/* Header section */}
        <div style={userPopupHeaderStyles}>
          {/* Avatar + Name */}
          <div style={userPopupAvatarNameBoxStyles}>
            <div style={userPopupAvatarWrapperStyles}>
              <Avatar
                src={isValidAvatar ? userAvatar : undefined}
                alt={displayName}
                sx={{
                  width: '100%',
                  height: '100%',
                  bgcolor: 'primary.dark',
                  fontSize: 24,
                  fontWeight: 700,
                }}
              >
                {displayName?.[0]?.toUpperCase() || 'U'}
              </Avatar>
            </div>
            <div>
              <div style={userPopupUsernameStyles}>{displayName || 'User'}</div>
              {!isTeacher && (
                <div style={userPopupLevelStyles}>
                  LEVEL {level} • {levelTitle.toUpperCase()}
                </div>
              )}
            </div>
          </div>

          {/* XP Bar */}
          {!isTeacher && (
            <div>
              <div style={userPopupXpRowStyles}>
                <span style={userPopupXpLabelStyles}>EXPERIENCE</span>
                <span style={userPopupXpValueStyles}>
                  {currentXP} / {maxXP} XP
                </span>
              </div>
              <div style={userPopupXpBarContainerStyles}>
                <div style={getUserPopupXpBarFillStyles(xpPercent)} />
              </div>
            </div>
          )}
        </div>

        {/* AI Credits Terminal */}
        {!isTeacher && (
          <Box sx={{ px: 2.5, pt: 1.5, pb: 0.5 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                bgcolor: '#f8f9fa',
                borderRadius: '10px',
                p: '8px 12px',
                border: '1px solid #e2e8f0',
              }}
            >
              <Typography
                sx={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  color: '#64748b',
                  letterSpacing: '0.5px',
                }}
              >
                AI CREDITS
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                {/* Weekly Turns */}
                <Tooltip
                  slotProps={{
                    box: {
                      backgroundColor: 'info.pastel',
                      color: 'text.primary',
                    },
                    popper: {
                      sx: {
                        '& .MuiTooltip-tooltip': {
                          backgroundColor: 'info.pastel',
                          color: 'text.primary',
                        },
                      },
                    },
                  }}
                  title="Weekly AI turns. These reset to a fixed amount every week."
                  placement="top"
                  arrow
                >
                  <Box
                    sx={{ display: 'flex', alignItems: 'center', gap: 0.4, px: 1, cursor: 'help' }}
                  >
                    <Box sx={{ color: 'info.dark', display: 'flex' }}>
                      <AutoAwesomeIcon sx={{ fontSize: 16 }} />
                    </Box>
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: 'info.dark' }}>
                      {weeklyTurns}
                    </Typography>
                  </Box>
                </Tooltip>
                {/* Bonus Turns with popout color */}
                <Tooltip
                  slotProps={{
                    box: {
                      backgroundColor: 'warning.pastel',
                    },
                    popper: {
                      sx: {
                        '& .MuiTooltip-tooltip': {
                          backgroundColor: 'warning.pastel',
                          color: 'text.primary',
                        },
                      },
                    },
                  }}
                  title="Bonus AI turns. Earned by leveling up with XP or reaching streak milestones."
                  placement="top"
                  arrow
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.4,
                      background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                      px: 1,
                      py: 0.3,
                      borderRadius: '15px',
                      border: '1px solid #fde68a',
                      boxShadow: '0 2px 8px rgba(245, 158, 11, 0.2)',
                      cursor: 'help',
                    }}
                  >
                    <Typography
                      sx={{ fontSize: '0.85rem', fontWeight: 800, color: 'secondary.main' }}
                    >
                      +{bonusTurns}
                    </Typography>
                  </Box>
                </Tooltip>
              </Box>
            </Box>
          </Box>
        )}

        {/* Divider */}
        <div style={userPopupDividerStyles} />

        {/* Menu Items */}
        <div style={userPopupMenuContainerStyles}>
          <button
            onClick={() => onNavigate(user?.role === 'T' ? '/teacher/profile' : '/student/profile')}
            style={userPopupMenuItemStyles}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#f5f5f5')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
          >
            <span style={userPopupMenuItemIconStyles}>
              <ProfileIcon />
            </span>
            My Profile
          </button>

          {user?.role !== 'T' && (
            <button
              onClick={() => onNavigate('/student/dashboard')}
              style={userPopupMenuItemStyles}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#f5f5f5')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
            >
              <span style={userPopupMenuItemIconStyles}>
                <DashboardIcon />
              </span>
              Learning Dashboard
            </button>
          )}

          <button
            onClick={onLogout}
            style={userPopupMenuItemLogoutStyles}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#fff5f5')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
          >
            <LogoutIcon />
            Logout
          </button>
        </div>
      </div>
    </>
  );
}

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, logout: logoutHook } = useAuth(null);
  const { isCelebrationDismissed } = useStreakContext();
  const [popupOpen, setPopupOpen] = useState(false);
  const [userAvatar, setUserAvatar] = useState(null);
  const [studentProfile, setStudentProfile] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionType, setActionType] = useState('register');
  const avatarWrapperRef = useRef(null);
  const topDisplayName =
    (studentProfile && (studentProfile.full_name || studentProfile.fullName)) ||
    user?.full_name ||
    (typeof window !== 'undefined' ? localStorage.getItem('full_name') : null) ||
    user?.username ||
    'User';

  const fetchProfile = async () => {
    if (user && user.role !== 'T') {
      try {
        const profile = await getStudentProfile(user.id);
        setStudentProfile(profile);
      } catch (error) {
        console.error('Failed to fetch student profile:', error);
      }
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const latest =
      localStorage.getItem('avatar_url') ||
      localStorage.getItem('avatar') ||
      studentProfile?.avatar_url ||
      null;
    setUserAvatar(latest);
  }, [studentProfile]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const syncAvatar = () => {
      const latestAvatar = localStorage.getItem('avatar_url') || localStorage.getItem('avatar');
      const latestFull = localStorage.getItem('full_name');
      setUserAvatar(latestAvatar || null);
      setStudentProfile((prev) =>
        prev
          ? { ...prev, avatar_url: latestAvatar || '', full_name: latestFull || prev.full_name }
          : prev,
      );
    };
    window.addEventListener('auth-user-updated', syncAvatar);
    window.addEventListener('storage', syncAvatar);
    return () => {
      window.removeEventListener('auth-user-updated', syncAvatar);
      window.removeEventListener('storage', syncAvatar);
    };
  }, []);

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

  const handleLogout = async () => {
    setPopupOpen(false);
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

  const handleNavigate = (path) => {
    setPopupOpen(false);
    router.push(path);
  };

  const navItemStyle = (segment) => ({
    ...navButtonStyles,
    borderRadius: 0,
    backgroundColor: 'transparent',
    color: pathname?.includes(segment) ? 'secondary.main' : 'primary.main',
    fontWeight: pathname?.includes(segment) ? 700 : 500,
    borderBottom: '3px solid',
    borderColor: pathname?.includes(segment) ? 'secondary.main' : 'transparent',
    px: 1,
    pt: 1.5,
    pb: 0.5,
    marginX: '15px',
    transition: 'all 0.2s',
    '&:hover': { backgroundColor: 'transparent' },
  });

  return (
    <>
      <AppBar position="static" sx={appBarStyles}>
        <Container maxWidth="lg">
          <Toolbar sx={toolbarStyles}>
            <Box sx={navBoxStyles}>
              <Link href="/" style={logoLinkStyles}>
                <Image src={Logo} alt="NENS" width={32} height={24} />
              </Link>
              {[
                { href: '/student/reading', label: 'Reading', seg: '/reading' },
                { href: '/student/listening', label: 'Listening', seg: '/listening' },
                { href: '/student/writing', label: 'Writing', seg: '/writing' },
                { href: '/student/speaking', label: 'Speaking', seg: '/speaking' },
              ].map(({ href, label, seg }) => (
                <Link key={seg} href={href} style={navLinkStyles}>
                  <Button color="inherit" sx={navItemStyle(seg)}>
                    {label}
                  </Button>
                </Link>
              ))}
            </Box>

            <Box sx={actionBoxStyles}>
              {isAuthenticated && user ? (
                (() => {
                  const isValidAvatar =
                    userAvatar && userAvatar !== 'null' && userAvatar !== 'undefined';
                  return (
                    <>
                      {!isCelebrationDismissed && <AnimatedStreakBadge />}
                      <StreakBadge />
                      <NotificationBell />

                      {/* Avatar button + Popup wrapper */}
                      <Box
                        ref={avatarWrapperRef}
                        sx={{ position: 'relative', display: 'flex', alignItems: 'center' }}
                      >
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
                              setPopupOpen((v) => !v);
                            }
                          }}
                          onClick={() => setPopupOpen((v) => !v)}
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
                              src={isValidAvatar ? userAvatar : undefined}
                              alt={topDisplayName || 'User'}
                              sx={{
                                backgroundColor: 'primary.main',
                                width: 40,
                                height: 40,
                                border: '2px solid',
                                borderColor: popupOpen ? 'warning.main' : 'secondary.main',
                                transition: 'border-color 0.2s',
                              }}
                            >
                              {topDisplayName?.[0]?.toUpperCase() || 'U'}
                            </Avatar>
                          </Badge>
                          {/* <Typography
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
                          </Typography> */}
                        </Box>

                        {/* Custom Popup */}
                        {popupOpen && (
                          <UserPopup
                            user={user}
                            studentProfile={studentProfile}
                            userAvatar={userAvatar}
                            onClose={() => setPopupOpen(false)}
                            onLogout={handleLogout}
                            onNavigate={handleNavigate}
                          />
                        )}
                      </Box>
                    </>
                  );
                })()
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
