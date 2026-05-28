'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Avatar,
  Badge,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  ListItemAvatar,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { useNotifications } from './NotificationProvider';

function getFeedbackRoute(notification) {
  if (!notification) {
    return null;
  }

  const testId = notification.testId ?? notification.test_id;
  const skill = notification.skill?.toLowerCase();

  if (!testId || !skill) {
    return null;
  }

  return `/teacher/view-test/${skill}/${testId}/feedback`;
}

function getPostRoute(notification) {
  if (!notification) {
    return null;
  }

  const testId = notification.testId ?? notification.test_id;
  const postId = notification.postId ?? notification.post_id;
  const skill = notification.skill?.toLowerCase();

  if (!testId || !postId || !skill) {
    return null;
  }

  return `/student/${skill}/${testId}/forum?open_post=${postId}`;
}

function getNotificationRoute(notification, userRole) {
  if (userRole === 'S') {
    return getPostRoute(notification);
  }

  return getFeedbackRoute(notification);
}

function formatRelativeTime(value) {
  const createdAt = new Date(value);
  const diffMinutes = Math.max(1, Math.floor((Date.now() - createdAt.getTime()) / 60000));

  if (diffMinutes < 60) {
    return `${diffMinutes} minutes`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours} hours`;
  }

  return `${Math.floor(diffHours / 24)} days`;
}

export default function NotificationBell() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const {
    notifications,
    unreadCount,
    isLoading,
    isLoadingMore,
    hasMore,
    markAllAsRead,
    markNotificationRead,
    refreshNotifications,
    loadMoreNotifications,
    userRole,
  } = useNotifications();
  const [anchorEl, setAnchorEl] = useState(null);
  const [filter, setFilter] = useState('all');

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleFilterChange = (nextFilter) => {
    if (nextFilter === filter) {
      return;
    }

    setFilter(nextFilter);
    refreshNotifications(nextFilter === 'unread' ? { isRead: false } : {});
  };

  const handleNotificationClick = async (notification) => {
    const route = getNotificationRoute(notification, userRole);

    if (!notification.isRead) {
      await markNotificationRead(notification.id);
    }

    handleClose();

    if (route) {
      router.push(route);
    }
  };

  return (
    <>
      <IconButton
        aria-label="Open notifications"
        onClick={handleOpen}
        size="small"
        sx={{
          width: 40,
          height: 40,
          color: 'primary.main',
          border: '1px solid',
          borderColor: 'rgba(83, 40, 34, 0.12)',
          bgcolor: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 10px 30px rgba(83, 40, 34, 0.08)',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease',
          '&:hover': {
            bgcolor: 'background.paper',
            transform: 'translateY(-1px)',
            boxShadow: '0 14px 36px rgba(83, 40, 34, 0.12)',
          },
        }}
      >
        <Badge color="error" badgeContent={unreadCount} max={99}>
          <NotificationsNoneOutlinedIcon fontSize="small" />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        marginThreshold={0}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        MenuListProps={{
          disablePadding: true,
          sx: {
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            minHeight: 0,
            p: 0,
          },
        }}
        PaperProps={{
          sx: {
            mt: 0.75,
            width: isMobile ? 'min(300px, calc(100vw - 20px))' : 380,
            maxWidth: isMobile ? 'min(300px, calc(100vw - 20px))' : 380,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 4,
            overflow: 'hidden',
            border: '1px solid rgba(83, 40, 34, 0.10)',
            boxShadow: '0 22px 60px rgba(83, 40, 34, 0.18)',
            background: 'rgba(255,255,255,0.98)',
          },
        }}
      >
        <Box
          sx={{
            px: { xs: 1.5, sm: 2 },
            py: { xs: 1.25, sm: 1.5 },
            background: 'rgba(83, 40, 34, 0.04)',
            flexShrink: 0,
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1.5}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0, flex: 1 }}>
              <Box
                sx={{
                  width: { xs: 32, sm: 36 },
                  height: { xs: 32, sm: 36 },
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: 'rgba(255,255,255,0.9)',
                  color: 'primary.main',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8)',
                }}
              >
                <NotificationsActiveOutlinedIcon fontSize="small" />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 800, lineHeight: 1.2, fontSize: { xs: '0.98rem', sm: '1rem' } }}
                >
                  Notifications
                </Typography>
              </Box>
            </Box>

            <Chip
              size="small"
              label={unreadCount ? `${unreadCount} unread` : 'All read'}
              color={unreadCount ? 'error' : 'default'}
              variant={unreadCount ? 'filled' : 'outlined'}
              sx={{
                flexShrink: 0,
                fontWeight: 700,
                bgcolor: unreadCount ? 'primary.main' : 'background.paper',
                borderColor: 'primary.main',
                '& .MuiChip-label': {
                  px: { xs: 1, sm: 1.25 },
                  fontSize: { xs: 11, sm: 12 },
                },
              }}
            />
          </Stack>
        </Box>

        <Divider />

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            gap: 1,
            px: { xs: 1.5, sm: 2 },
            py: 1.25,
            bgcolor: 'background.paper',
            flexShrink: 0,
          }}
        >
          <Button
            size="small"
            variant="outlined"
            onClick={() => refreshNotifications(filter === 'unread' ? { isRead: false } : {})}
            disabled={isLoading}
            startIcon={<RefreshOutlinedIcon fontSize="small" />}
            sx={{
              flex: 1,
              minWidth: 0,
              px: { xs: 0.75, sm: 1.5 },
              fontSize: { xs: 12, sm: 14 },
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              '& .MuiButton-startIcon': {
                mr: 0.75,
                flexShrink: 0,
              },
              '& .MuiButton-startIcon > *:nth-of-type(1)': {
                fontSize: 16,
              },
            }}
          >
            Refresh...
          </Button>
          <Button
            size="small"
            variant="contained"
            onClick={markAllAsRead}
            disabled={!unreadCount}
            startIcon={<DoneAllIcon fontSize="small" />}
            sx={{
              flex: 1,
              minWidth: 0,
              px: { xs: 0.75, sm: 1.5 },
              fontSize: { xs: 12, sm: 14 },
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              '& .MuiButton-startIcon': {
                mr: 0.75,
                flexShrink: 0,
              },
              '& .MuiButton-startIcon > *:nth-of-type(1)': {
                fontSize: 16,
              },
            }}
          >
            <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
              Mark all...
            </Box>
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
              Mark all as read
            </Box>
          </Button>
        </Box>

        <Divider />

        <Box
          sx={{
            px: { xs: 1.5, sm: 2 },
            pt: 1.5,
            pb: 0.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary' }}>
            Previous
          </Typography>
        </Box>

        <Box
          sx={{
            px: { xs: 1.5, sm: 2 },
            pb: 1.25,
            display: 'flex',
            gap: 1,
            flexWrap: 'wrap',
            flexShrink: 0,
          }}
        >
          <Chip
            label="All"
            clickable
            onClick={() => handleFilterChange('all')}
            variant={filter === 'all' ? 'filled' : 'outlined'}
            color={filter === 'all' ? 'primary' : 'default'}
            sx={{ fontWeight: 700, flex: { xs: '1 1 calc(50% - 4px)', sm: '0 0 auto' } }}
          />
          <Chip
            label="Unread"
            clickable
            onClick={() => handleFilterChange('unread')}
            variant={filter === 'unread' ? 'filled' : 'outlined'}
            color={filter === 'unread' ? 'primary' : 'default'}
            sx={{ fontWeight: 700, flex: { xs: '1 1 calc(50% - 4px)', sm: '0 0 auto' } }}
          />
        </Box>

        {notifications.length === 0 ? (
          <Box sx={{ px: { xs: 1.5, sm: 2 }, py: 3, flexShrink: 0 }}>
            <Box
              sx={{
                borderRadius: 3,
                border: '1px dashed',
                borderColor: 'primary.main',
                bgcolor: 'background.paper',
                px: 2,
                py: 2.5,
                textAlign: 'center',
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  mx: 'auto',
                  mb: 1.5,
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: 'gray.light',
                  color: 'primary.main',
                }}
              >
                <NotificationsNoneOutlinedIcon />
              </Box>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 700, mb: 0.5, fontSize: { xs: 13, sm: 14 } }}
              >
                No notifications yet
              </Typography>
            </Box>
          </Box>
        ) : (
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
              overscrollBehavior: 'contain',
              pb: 1,
            }}
          >
            {notifications.map((notification) =>
              (() => {
                const author = notification.author || notification.createdBy || {};
                const targetTitle =
                  userRole === 'S'
                    ? notification.postTitle || 'post'
                    : notification.testName || 'test';
                const connectorText =
                  userRole === 'S' ? ' commented on your ' : ' gave feedback on your ';

                return (
                  <MenuItem
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    sx={{
                      flexShrink: 0,
                      minHeight: 'auto',
                      alignItems: 'flex-start',
                      whiteSpace: 'normal',
                      px: { xs: 1.25, sm: 2 },
                      py: { xs: 0.75, sm: 1.35 },
                      gap: { xs: 0.75, sm: 1.25 },
                      borderBottom: '1px solid rgba(83, 40, 34, 0.08)',
                      transition: 'background-color 0.2s ease, transform 0.2s ease',
                      bgcolor: notification.isRead
                        ? 'rgba(255,255,255,1)'
                        : 'rgba(219, 234, 254, 0.95)',
                      '&:hover': {
                        bgcolor: notification.isRead
                          ? 'rgba(83, 40, 34, 0.06)'
                          : 'rgba(191, 219, 254, 1)',
                      },
                    }}
                  >
                    <ListItemAvatar sx={{ minWidth: { xs: 38, sm: 52 } }}>
                      <Avatar
                        src={author.avatar}
                        alt={author.name}
                        sx={{
                          width: { xs: 30, sm: 44 },
                          height: { xs: 30, sm: 44 },
                        }}
                      >
                        {author.name?.charAt(0) || '?'}
                      </Avatar>
                    </ListItemAvatar>

                    <ListItemText
                      sx={{ my: 0 }}
                      primary={
                        <Stack
                          direction={{ xs: 'column', sm: 'row' }}
                          alignItems={{ xs: 'flex-start', sm: 'flex-start' }}
                          justifyContent="space-between"
                          gap={0.5}
                        >
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: notification.isRead ? 700 : 800,
                                color: 'text.primary',
                                lineHeight: 1.2,
                                fontSize: { xs: 12, sm: 14 },
                                display: '-webkit-box',
                                WebkitBoxOrient: 'vertical',
                                WebkitLineClamp: 1,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              <Box component="span">{author.name}</Box>
                              <Box component="span" sx={{ fontWeight: 400 }}>
                                {connectorText}
                              </Box>
                              <Box component="span">{targetTitle}</Box>
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                mt: 0.25,
                                color: notification.isRead ? 'text.secondary' : 'text.primary',
                                lineHeight: 1.25,
                                fontSize: { xs: 11.5, sm: 14 },
                                display: '-webkit-box',
                                WebkitLineClamp: 1,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}
                            >
                              {notification.message}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                mt: 0.25,
                                display: 'block',
                                color: 'text.secondary',
                                fontWeight: 600,
                                fontSize: { xs: 10, sm: 12 },
                              }}
                            >
                              {formatRelativeTime(notification.createdAt)}
                            </Typography>
                          </Box>

                          <Box
                            sx={{
                              pt: { xs: 0, sm: 0.65 },
                              minWidth: 18,
                              display: 'flex',
                              justifyContent: 'center',
                              alignSelf: { xs: 'flex-end', sm: 'auto' },
                            }}
                          >
                            {!notification.isRead ? (
                              <Box
                                sx={{
                                  width: { xs: 10, sm: 12 },
                                  height: { xs: 10, sm: 12 },
                                  borderRadius: '50%',
                                  bgcolor: '#3b82f6',
                                  boxShadow: '0 0 0 5px rgba(59, 130, 246, 0.2)',
                                }}
                              />
                            ) : (
                              <Box sx={{ width: 11, height: 11 }} />
                            )}
                          </Box>
                        </Stack>
                      }
                    />
                  </MenuItem>
                );
              })(),
            )}

            {hasMore ? (
              <Box sx={{ px: { xs: 1.5, sm: 2 }, pt: 1, pb: 1.5, flexShrink: 0 }}>
                <Button
                  fullWidth
                  size="small"
                  variant="outlined"
                  onClick={() => loadMoreNotifications()}
                  disabled={isLoadingMore || isLoading}
                  sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                >
                  {isLoadingMore ? 'Loading...' : 'Load more'}
                </Button>
              </Box>
            ) : null}
          </Box>
        )}
      </Menu>
    </>
  );
}
