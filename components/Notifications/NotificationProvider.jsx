'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '../../api/notifications';

const NotificationContext = createContext(null);

const MAX_NOTIFICATIONS = 20;

function dedupeNotifications(list) {
  const seen = new Set();

  return list.filter((notification) => {
    if (seen.has(notification.id)) {
      return false;
    }

    seen.add(notification.id);
    return true;
  });
}

function extractNextPage(nextUrl) {
  if (!nextUrl || typeof nextUrl !== 'string') {
    return null;
  }

  try {
    const parsed = new URL(
      nextUrl,
      typeof window !== 'undefined' ? window.location.origin : undefined,
    );
    const page = Number(parsed.searchParams.get('page'));
    return Number.isFinite(page) && page > 0 ? page : null;
  } catch {
    const matched = nextUrl.match(/[?&]page=(\d+)/i);
    if (!matched) {
      return null;
    }

    const page = Number(matched[1]);
    return Number.isFinite(page) && page > 0 ? page : null;
  }
}

export function useNotifications() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }

  return context;
}

export function NotificationProvider({ children }) {
  const { isAuthenticated, user } = useAuth(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [nextPage, setNextPage] = useState(null);
  const [activeQuery, setActiveQuery] = useState({});
  const userRole = user?.role;

  const scopedNotifications = useMemo(() => notifications, [notifications]);

  const refreshUnreadCount = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      setUnreadCount(0);
      return;
    }

    try {
      const response = await getUnreadNotificationCount();
      const count = response.unread_count || 0;
      setUnreadCount(Math.max(0, count));
    } catch (error) {
      console.error('Failed to load unread count:', error);
      setUnreadCount(0);
    }
  }, [isAuthenticated, user?.id]);

  const hydrateNotifications = useCallback(
    async (options = {}) => {
      if (!isAuthenticated || !user?.id) {
        return;
      }

      const query =
        options.isRead === undefined || options.isRead === null
          ? {}
          : { isRead: Boolean(options.isRead) };

      setIsLoading(true);
      setActiveQuery(query);

      try {
        const response = await getNotifications(query);
        const normalized = response.results.map((item) => ({
          id: item.id,
          type: item.type,
          message: item.message,
          createdAt: item.created_at,
          isRead: Boolean(item.is_read),
          testId: item.test_id,
          testName: item.type === 'C' ? null : item.test_name,
          postId: item.type === 'C' ? item.post_id : null,
          postTitle: item.type === 'C' ? item.post_title : null,
          skill: item.skill,
          author: item.author,
        }));

        setNotifications(dedupeNotifications(normalized).slice(0, MAX_NOTIFICATIONS));
        setNextPage(extractNextPage(response?.next));
        await refreshUnreadCount();
      } catch (error) {
        console.error('Failed to load notifications:', error);

        setNotifications([]);
        setNextPage(null);
        setUnreadCount(0);
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated, refreshUnreadCount, user?.id],
  );

  const loadMoreNotifications = useCallback(async () => {
    if (!nextPage || !isAuthenticated || !user?.id || isLoadingMore) {
      return;
    }

    setIsLoadingMore(true);

    try {
      const response = await getNotifications({ ...activeQuery, page: nextPage });
      const normalized = response.results.map((item) => ({
        id: item.id,
        type: item.type,
        message: item.message,
        createdAt: item.created_at,
        isRead: Boolean(item.is_read),
        testId: item.type === 'C' ? null : item.test_id,
        testName: item.type === 'C' ? null : item.test_name,
        postId: item.type === 'C' ? item.post_id : null,
        postTitle: item.type === 'C' ? item.post_title : null,
        skill: item.skill,
        author: item.author,
      }));

      setNotifications((current) =>
        dedupeNotifications([...current, ...normalized]).slice(0, MAX_NOTIFICATIONS * 5),
      );
      setNextPage(extractNextPage(response?.next));
      await refreshUnreadCount();
    } catch (error) {
      console.error('Failed to load more notifications:', error);
      setNextPage(null);
    } finally {
      setIsLoadingMore(false);
    }
  }, [activeQuery, isAuthenticated, isLoadingMore, nextPage, refreshUnreadCount, user?.id]);

  const markNotificationRead = useCallback(
    async (notificationId) => {
      try {
        await markNotificationAsRead(notificationId);
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }

      setNotifications((current) => {
        if (activeQuery.isRead === false) {
          return current.filter((notification) => notification.id !== notificationId);
        }

        return current.map((notification) =>
          notification.id === notificationId ? { ...notification, isRead: true } : notification,
        );
      });
      setUnreadCount((current) => Math.max(0, current - 1));
    },
    [activeQuery.isRead],
  );

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      setNotifications([]);
      setUnreadCount(0);
      setNextPage(null);
      setActiveQuery({});
      setIsLoading(false);

      return undefined;
    }

    setNotifications([]);
    setUnreadCount(0);
    setNextPage(null);
    setActiveQuery({});

    hydrateNotifications();

    return undefined;
  }, [hydrateNotifications, isAuthenticated, user?.id]);

  const markAllAsRead = useCallback(async () => {
    try {
      await markAllNotificationsAsRead();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }

    setNotifications((current) => {
      if (activeQuery.isRead === false) {
        return [];
      }

      return current.map((notification) => ({ ...notification, isRead: true }));
    });
    setUnreadCount(0);
  }, [activeQuery]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
    setNextPage(null);
  }, []);

  const value = useMemo(
    () => ({
      notifications: scopedNotifications,
      unreadCount,
      isLoading,
      isLoadingMore,
      hasMore: Boolean(nextPage),
      markAllAsRead,
      markNotificationRead,
      clearNotifications,
      refreshNotifications: hydrateNotifications,
      loadMoreNotifications,
      userRole,
    }),
    [
      clearNotifications,
      hydrateNotifications,
      isLoadingMore,
      isLoading,
      loadMoreNotifications,
      markAllAsRead,
      markNotificationRead,
      nextPage,
      userRole,
      scopedNotifications,
      unreadCount,
    ],
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}
