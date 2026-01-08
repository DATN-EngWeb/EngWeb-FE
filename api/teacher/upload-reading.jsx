/* eslint-env browser */
/* global fetch, Blob */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
if (!API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_BASE_URL is required but not set in .env');
}

// Định nghĩa Base URL cho phần Tests (tương tự như ACCOUNTS_BASE_URL)
const TESTS_BASE_URL = `${API_BASE_URL.replace(/\/$/, '')}/api/tests`;

// Hàm xử lý response chung (Copy từ mẫu của bạn để đảm bảo đồng bộ cách bắt lỗi)
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

// Hàm createNewTest viết lại theo phong cách fetch và handleResponse
// Lưu ý: accessToken được truyền vào tham số (giống hàm logout ở mẫu)
export async function createNewTest(testData, accessToken) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${TESTS_BASE_URL}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(testData),
    cache: 'no-store',
  });

  return handleResponse(response);
}

// Hàm upload nội dung Reading Test (Parts)
// Endpoint: /api/tests/receptive/{test_id}/
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
