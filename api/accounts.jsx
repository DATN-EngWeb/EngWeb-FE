/* eslint-env browser */
/* global fetch */
import { apiFetch } from './client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
if (!API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_BASE_URL is required but not set in .env');
}
const ACCOUNTS_BASE_URL = `${API_BASE_URL.replace(/\/$/, '')}/api/accounts`;

async function handleResponse(response) {
  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
    ? await response.json().catch(() => null)
    : null;

  if (response.ok) {
    return data ?? {};
  }

  // Create error with full data for detailed error handling
  const errorMessage =
    data?.message ||
    data?.detail ||
    data?.error ||
    data?.errors ||
    Object.values(data || {})?.[0]?.[0] ||
    'Something went wrong';

  if (response.status === 401 && typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('avatar');
    localStorage.removeItem('userStatus');
    document.cookie = 'userRole=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
    window.location.href = '/login';
    return new Promise(() => {});
  }

  const error = new Error(errorMessage);
  error.data = data; // Include full error data
  error.status = response.status;

  throw error;
}

export async function registerUser({ username, email, password, role }) {
  const response = await fetch(`${ACCOUNTS_BASE_URL}/registration`, {
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
  const response = await fetch(`${ACCOUNTS_BASE_URL}/verify-otp/registration`, {
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
  const response = await fetch(`${ACCOUNTS_BASE_URL}/resend-otp/registration`, {
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

export async function createTeacherProfile(formData) {
  const response = await fetch(`${ACCOUNTS_BASE_URL}/teachers/submit-profile`, {
    method: 'POST',
    body: formData,
    cache: 'no-store',
  });

  return handleResponse(response);
}

export async function login({ username, password }) {
  const response = await fetch(`${ACCOUNTS_BASE_URL}/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username,
      password,
    }),
    cache: 'no-store',
  });

  return handleResponse(response);
}

export async function refreshToken(refreshTokenValue) {
  const response = await fetch(`${ACCOUNTS_BASE_URL}/token/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      refresh: refreshTokenValue,
    }),
    cache: 'no-store',
  });

  return handleResponse(response);
}

export async function logout(refreshTokenValue, accessToken) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${ACCOUNTS_BASE_URL}/logout`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      refresh: refreshTokenValue,
    }),
    cache: 'no-store',
  });

  return handleResponse(response);
}

export async function forgotPassword(usernameOrEmail) {
  const response = await fetch(`${ACCOUNTS_BASE_URL}/forgot-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username_or_email: usernameOrEmail,
    }),
    cache: 'no-store',
  });

  return handleResponse(response);
}

export async function verifyForgotPasswordOtp({ username, otpCode }) {
  const response = await fetch(`${ACCOUNTS_BASE_URL}/verify-otp/forgot-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username,
      otp_code: otpCode,
    }),
    cache: 'no-store',
  });

  return handleResponse(response);
}

export async function resendForgotPasswordOtp({ username }) {
  const response = await fetch(`${ACCOUNTS_BASE_URL}/resend-otp/forgot-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username,
    }),
    cache: 'no-store',
  });

  return handleResponse(response);
}

export async function resetPassword({ resetToken, newPassword }) {
  const response = await fetch(`${ACCOUNTS_BASE_URL}/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      reset_token: resetToken,
      new_password: newPassword,
    }),
    cache: 'no-store',
  });

  return handleResponse(response);
}

export async function googleLogin(code, role) {
  const response = await fetch(`${ACCOUNTS_BASE_URL}/auth/google/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      code,
      role,
    }),
    cache: 'no-store',
  });

  return handleResponse(response);
}

export async function facebookLogin(code, role) {
  const response = await fetch(`${ACCOUNTS_BASE_URL}/auth/facebook/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      code,
      role,
    }),
    cache: 'no-store',
  });

  return handleResponse(response);
}

export async function getTeacherProfile(teacherId) {
  return apiFetch(`${ACCOUNTS_BASE_URL}/teachers/${teacherId}`, {
    method: 'GET',
    cache: 'no-store',
  });
}

export async function updateTeacherProfile(teacherId, formData) {
  return apiFetch(`${ACCOUNTS_BASE_URL}/teachers/${teacherId}`, {
    method: 'PATCH',
    body: formData,
    cache: 'no-store',
  });
}

export async function getStudentProfile(studentId) {
  return apiFetch(`${ACCOUNTS_BASE_URL}/students/${studentId}`, {
    method: 'GET',
    cache: 'no-store',
  });
}

export async function updateStudentProfile(studentId, formData) {
  return apiFetch(`${ACCOUNTS_BASE_URL}/students/${studentId}`, {
    method: 'PATCH',
    body: formData,
    cache: 'no-store',
  });
}
