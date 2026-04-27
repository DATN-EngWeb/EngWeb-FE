/* eslint-env browser */
/* global URLSearchParams */
import { apiFetch } from './client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_BASE_URL is required but not set in .env');
}

const NOTIFICATIONS_BASE_URL =
  process.env.NEXT_PUBLIC_NOTIFICATION_API_URL ||
  `${API_BASE_URL.replace(/\/$/, '')}/api/notifications`;

function buildQuery(params) {
  const query = new URLSearchParams();

  if (params?.isRead !== undefined && params?.isRead !== null) {
    query.set('is_read', String(params.isRead));
  }

  if (params?.page) {
    query.set('page', String(params.page));
  }

  return query.toString();
}

export async function getNotifications(params = {}) {
  const query = buildQuery(params);

  return apiFetch(`${NOTIFICATIONS_BASE_URL}/read-all${query ? `?${query}` : ''}`, {
    method: 'GET',
    cache: 'no-store',
  });
}

export async function markNotificationAsRead(notificationId) {
  return apiFetch(`${NOTIFICATIONS_BASE_URL}/mark-read/${notificationId}`, {
    method: 'PATCH',
    cache: 'no-store',
  });
}

export async function markAllNotificationsAsRead() {
  return apiFetch(`${NOTIFICATIONS_BASE_URL}/mark-all-read`, {
    method: 'PATCH',
    cache: 'no-store',
  });
}

export async function getUnreadNotificationCount() {
  return apiFetch(`${NOTIFICATIONS_BASE_URL}/unread-count`, {
    method: 'GET',
    cache: 'no-store',
  });
}
