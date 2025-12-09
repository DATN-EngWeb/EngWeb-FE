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

  // Create error with full data for detailed error handling
  const error = new Error();
  error.message =
    data?.message ||
    data?.detail ||
    data?.error ||
    data?.errors ||
    Object.values(data || {})?.[0]?.[0] ||
    'Something went wrong';
  error.data = data; // Include full error data
  error.status = response.status;

  throw error;
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

export async function createTeacherProfile(formData) {
  const response = await fetch(`${ACCOUNTS_BASE_URL}/teachers`, {
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
