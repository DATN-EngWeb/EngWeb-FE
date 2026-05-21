/* eslint-env browser */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const ACCOUNTS_BASE_URL = `${(API_BASE_URL || '').replace(/\/$/, '')}/api/accounts`;

let accessToken: string | null = null;
let refreshPromise: Promise<string> | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
  localStorage.setItem('accessToken', token || '');
}

export function getAccessToken() {
  return localStorage.getItem('accessToken');
}

export function setRefreshToken(token: string | null) {
  localStorage.setItem('refreshToken', token || '');
}

export function getRefreshToken() {
  return localStorage.getItem('refreshToken');
}

async function handleResponse(response: Response) {
  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
    ? await response.json().catch(() => null)
    : null;

  if (response.ok) return data ?? {};

  const error: any = new Error();
  error.message =
    data?.message ||
    data?.detail ||
    data?.error ||
    Object.values((data as Record<string, any>) || {})?.[0]?.[0] ||
    'Something went wrong';
  error.data = data;
  error.status = response.status;

  throw error;
}

async function refreshAccessToken() {
  if (!refreshPromise) {
    const refreshTokenValue = getRefreshToken();

    refreshPromise = fetch(`${ACCOUNTS_BASE_URL}/token/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshTokenValue }),
      cache: 'no-store',
    })
      .then(async (res) => {
        if (!res.ok) {
          const error: any = new Error('Refresh token expired or invalid');
          error.status = res.status;
          throw error;
        }
        return res.json();
      })
      .then((data) => {
        setAccessToken(data.access);
        setRefreshToken(data.refresh);
        return data.access as string;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

export async function apiFetch(url: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers || {});
  const token = accessToken || getAccessToken();
  const existingAuthorization = headers.get('Authorization');

  if (!existingAuthorization && token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    try {
      const newToken = await refreshAccessToken();

      headers.set('Authorization', `Bearer ${newToken}`);

      response = await fetch(url, {
        ...options,
        headers,
      });
    } catch (err) {
      accessToken = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('username');
      localStorage.removeItem('avatar');
      localStorage.removeItem('userStatus');
      localStorage.removeItem('userRole');
      document.cookie = 'userRole=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
      window.location.href = '/login';
      throw err;
    }
  }

  return handleResponse(response);
}
