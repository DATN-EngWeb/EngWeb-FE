/* eslint-env browser */
/* global URLSearchParams */
import { apiFetch } from './client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
if (!API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_BASE_URL is required but not set in .env');
}

const USER_PROGRESS_BASE_URL = `${API_BASE_URL.replace(/\/$/, '')}/api/user-progress`;

export const getUserProgressLevels = async (params = {}) => {
  const query = new URLSearchParams(params).toString();

  const url = query
    ? `${USER_PROGRESS_BASE_URL}/levels?${query}`
    : `${USER_PROGRESS_BASE_URL}/levels`;

  return apiFetch(url, {
    method: 'GET',
    cache: 'no-store',
  });
};
