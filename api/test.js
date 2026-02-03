/* eslint-env browser */
/* global fetch */
/* global URLSearchParams */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
if (!API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_BASE_URL is required but not set in .env');
}
const STORAGE_BASE_URL = `${API_BASE_URL.replace(/\/$/, '')}/api/storage`;
const TESTS_BASE_URL = `${API_BASE_URL.replace(/\/$/, '')}/api/tests`;

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

export const createTest = async (basicInfo, token) => {
  const response = await fetch(`${TESTS_BASE_URL}/overview`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(basicInfo),
  });

  return handleResponse(response);
};

export const getPresignedUrl = async (
  { filename, fileSize, mimeType, category, testId, part },
  token,
) => {
  const response = await fetch(`${STORAGE_BASE_URL}/presigned-urls`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      filename,
      file_size: fileSize,
      mime_type: mimeType,
      category,
      test_id: testId,
      part,
    }),
  });
  return handleResponse(response);
};

export const uploadToObjectStorage = async ({ url, mimeType, file }) => {
  // const formData = new FormData();
  // const parsedFields = typeof fields === 'string' ? JSON.parse(fields) : fields || {};

  // Object.entries(parsedFields).forEach(([key, value]) => {
  //   formData.append(key, value);
  // });

  // formData.append('file', file);

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': mimeType,
    },
    body: file,
  });

  if (!response.ok) {
    const error = new Error('Upload to object storage failed');
    error.status = response.status;
    error.data = await response.text().catch(() => null);
    throw error;
  }

  const etag = response.headers.get('ETag')?.replaceAll('"', '') || null;
  return { etag };
};

export const confirmUpload = async ({ key, fileSize, mimeType, etag }, token) => {
  const response = await fetch(`${STORAGE_BASE_URL}/confirmation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      key,
      file_size: fileSize,
      mime_type: mimeType,
      etag,
    }),
  });
  return handleResponse(response);
};

export const submitTestParts = async ({ testId, parts, token }) => {
  const response = await fetch(`${TESTS_BASE_URL}/receptive/${testId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ data: { parts } }),
  });

  return handleResponse(response);
};

export const getCriteria = async (level, token) => {
  const response = await fetch(`${TESTS_BASE_URL}/writing-criteria?level=${level}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  return handleResponse(response);
};

export const submitProductiveTest = async ({ testId, data, token }) => {
  const response = await fetch(`${TESTS_BASE_URL}/productive/${testId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ data }),
  });
  return handleResponse(response);
};

export const getListTest = async (token, isTeacher = false, status = null) => {
  const params = new URLSearchParams();

  if (isTeacher) params.append('mine', 'true');
  if (status) params.append('status', status);

  const queryString = params.toString() ? `?${params.toString()}` : '';
  const url = `${TESTS_BASE_URL}/overview${queryString}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  return handleResponse(response);
};
