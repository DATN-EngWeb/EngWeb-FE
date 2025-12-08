/* eslint-env browser */
/* global fetch */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
const ACCOUNTS_BASE_URL = `${API_BASE_URL.replace(/\/$/, '')}/api/accounts`;

async function handleResponse(response) {
  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
    ? await response.json().catch(() => null)
    : null;

  if (response.ok) {
    return data ?? {};
  }

  const message =
    data?.message ||
    data?.detail ||
    data?.error ||
    data?.errors ||
    Object.values(data || {})?.[0]?.[0] ||
    'Something went wrong';

  throw new Error(typeof message === 'string' ? message : 'Something went wrong');
}

export async function registerUser({ username, email, password, role }) {
  const response = await fetch(`${ACCOUNTS_BASE_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username,
      email,
      password,
      role,
    }),
    cache: 'no-store',
  });

  return handleResponse(response);
}

export async function verifyRegistrationOtp({ userId, otpCode }) {
  const response = await fetch(`${ACCOUNTS_BASE_URL}/verify-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_id: userId,
      otp_code: otpCode,
    }),
    cache: 'no-store',
  });

  return handleResponse(response);
}

export async function resendRegistrationOtp({ userId }) {
  const response = await fetch(`${ACCOUNTS_BASE_URL}/resend-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_id: userId,
    }),
    cache: 'no-store',
  });

  return handleResponse(response);
}
