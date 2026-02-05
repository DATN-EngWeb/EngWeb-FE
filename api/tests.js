/* global fetch, URLSearchParams */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
if (!API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_BASE_URL is required but not set in .env');
}
const TESTS_BASE_URL = `${API_BASE_URL.replace(/\/$/, '')}/api/tests`;

async function handleResponse(response) {
  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
    ? await response.json().catch(() => null)
    : null;

  if (response.ok) {
    return data ?? {};
  }

  const error = new Error();
  error.message =
    data?.message ||
    data?.detail ||
    data?.error ||
    data?.errors ||
    Object.values(data || {})?.[0]?.[0] ||
    'Something went wrong';
  error.data = data;
  error.status = response.status;

  throw error;
}

function buildQueryString(params) {
  if (!params || Object.keys(params).length === 0) {
    return '';
  }

  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, value);
    }
  });

  const queryString = queryParams.toString();
  return queryString ? `?${queryString}` : '';
}

export async function getTestOverview(filters = {}, accessToken = null) {
  const queryString = buildQueryString(filters);
  const headers = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${TESTS_BASE_URL}/overview${queryString}`, {
    method: 'GET',
    headers,
    cache: 'no-store',
  });

  return handleResponse(response);
}

export async function createTest(testData, accessToken) {
  const response = await fetch(`${TESTS_BASE_URL}/overview`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(testData),
    cache: 'no-store',
  });

  return handleResponse(response);
}

export async function createReceptiveTest(testId, testData, accessToken) {
  const response = await fetch(`${TESTS_BASE_URL}/receptive/${testId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(testData),
    cache: 'no-store',
  });

  return handleResponse(response);
}

export async function createProductiveTest(testId, testData, accessToken) {
  const response = await fetch(`${TESTS_BASE_URL}/productive/${testId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(testData),
    cache: 'no-store',
  });

  return handleResponse(response);
}

export async function getFullReceptiveTest(testId, accessToken = null) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${TESTS_BASE_URL}/full-test/receptive/${testId}`, {
    method: 'GET',
    headers,
    cache: 'no-store',
  });

  return handleResponse(response);
}

export async function getFullProductiveTest(testId, accessToken = null) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${TESTS_BASE_URL}/full-test/productive/${testId}`, {
    method: 'GET',
    headers,
    cache: 'no-store',
  });

  return handleResponse(response);
}

export async function getWritingCriteria(accessToken = null) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${TESTS_BASE_URL}/writing-criteria`, {
    method: 'GET',
    headers,
    cache: 'no-store',
  });

  return handleResponse(response);
}

export async function getCompletedBonus(accessToken = null) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${TESTS_BASE_URL}/completed-bonus`, {
    method: 'GET',
    headers,
    cache: 'no-store',
  });

  return handleResponse(response);
}
