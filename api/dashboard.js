/* eslint-env browser */
import { apiFetch } from './client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
if (!API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_BASE_URL is required but not set in .env');
}
const USER_PROGRESS = `${API_BASE_URL.replace(/\/$/, '')}/api/user-progress`;

export const getUserStreak = async () => {
  return apiFetch(`${USER_PROGRESS}/streak`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
