/* eslint-env browser */
/* global fetch, Blob */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
if (!API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_BASE_URL is required but not set in .env');
}

const TESTS_BASE_URL = `${API_BASE_URL.replace(/\/$/, '')}/api/tests`;

// Hàm xử lý response chung
async function handleResponse(response) {
  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
    ? await response.json().catch(() => null)
    : null;

  if (response.ok) {
    return data ?? {};
  }

  // Tạo object lỗi chi tiết
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

export async function createNewTest(testData, accessToken) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${TESTS_BASE_URL}/overview`, {
    method: 'POST',
    headers,
    body: JSON.stringify(testData),
    cache: 'no-store',
  });

  return handleResponse(response);
}

export async function uploadReadingTestContent(testId, partsData, accessToken) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const bodyPayload = {
    data: {
      parts: partsData,
    },
  };

  const response = await fetch(`${TESTS_BASE_URL}/receptive/${testId}`, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(bodyPayload),
    cache: 'no-store',
  });

  return handleResponse(response);
}

export async function getRecepiveTestDetails(testId, accessToken) {
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

export const fetchHtmlContent = async (url) => {
  if (!url || typeof url !== 'string' || !url.startsWith('http')) {
    return url;
  }
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Fetch failed');
    return await response.text();
  } catch (error) {
    console.error(`Lỗi tải nội dung từ: ${url}`, error);
    return '';
  }
};

export async function updateReadingTestContent(testId, updatePayload, accessToken) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${TESTS_BASE_URL}/full-test/receptive/${testId}`, {
    method: 'PATCH',
    headers: headers,
    body: JSON.stringify(updatePayload),
    cache: 'no-store',
  });

  return handleResponse(response);
}
