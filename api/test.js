/* eslint-env browser */
/* global fetch */
/* global URLSearchParams */
import { apiFetch } from './client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
if (!API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_BASE_URL is required but not set in .env');
}
const STORAGE_BASE_URL = `${API_BASE_URL.replace(/\/$/, '')}/api/storage`;
const TESTS_BASE_URL = `${API_BASE_URL.replace(/\/$/, '')}/api/tests`;
const TEST_HISTORIES_BASE_URL = `${API_BASE_URL.replace(/\/$/, '')}/api/test-histories`;
const TEST_AI_FEEDBACK_URL = `${API_BASE_URL.replace(/\/$/, '')}/api/feedback/ai-feedback`;

export const createTest = async (basicInfo) => {
  return apiFetch(`${TESTS_BASE_URL}/overview`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(basicInfo),
  });
};

export const getPresignedUrl = async ({ filename, fileSize, mimeType, category, testId, part }) => {
  return apiFetch(`${STORAGE_BASE_URL}/presigned-urls`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
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
};

export const uploadToObjectStorage = async ({ url, mimeType, file }) => {
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

export const confirmUpload = async ({ key, fileSize, mimeType, etag }) => {
  return apiFetch(`${STORAGE_BASE_URL}/confirmation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      key,
      file_size: fileSize,
      mime_type: mimeType,
      etag,
    }),
  });
};

export const submitTestParts = async ({ testId, parts }) => {
  return apiFetch(`${TESTS_BASE_URL}/receptive/${testId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data: { parts } }),
  });
};

export const getCriteria = async (level) => {
  return apiFetch(`${TESTS_BASE_URL}/writing-criteria?level=${level}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const submitProductiveTest = async ({ testId, data }) => {
  return apiFetch(`${TESTS_BASE_URL}/productive/${testId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data }),
  });
};

export const getListTest = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return apiFetch(`${TESTS_BASE_URL}/overview?${query}`, {
    method: 'GET',
  });
};

export const getProductiveTestDetails = async (testId) => {
  return apiFetch(`${TESTS_BASE_URL}/full-test/productive/${testId}`, {
    method: 'GET',
  });
};

export const updateProductiveTest = async (testId, data) => {
  return apiFetch(`${TESTS_BASE_URL}/full-test/productive/${testId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
};

export const updateTestParts = async ({ testId, basicInfo, receptiveTestData }) => {
  return apiFetch(`${TESTS_BASE_URL}/full-test/receptive/${testId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...(basicInfo && basicInfo),
      receptive_test: receptiveTestData,
    }),
  });
};

export async function getRecepiveTestDetails(testId) {
  return apiFetch(`${TESTS_BASE_URL}/full-test/receptive/${testId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });
}

export const fetchHtmlContent = async (url) => {
  if (!url || typeof url !== 'string' || !url.startsWith('http')) {
    return url;
  }
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Fetch failed');
    return await response.text();
  } catch (_error) {
    return '';
  }
};

export const createProductiveTest = async (data) => {
  return apiFetch(`${TEST_HISTORIES_BASE_URL}/productive`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
};

export const getProductiveTest = async (test_id) => {
  return apiFetch(`${TEST_HISTORIES_BASE_URL}/productive?productive_test=${test_id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const getReceptivetTest = async (test_id) => {
  return apiFetch(`${TEST_HISTORIES_BASE_URL}/receptive?receptive_test=${test_id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const getReceptiveTestDetails = async (testId) => {
  return apiFetch(`${TESTS_BASE_URL}/full-test/receptive/${testId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const createReceptiveTest = async (data) => {
  return apiFetch(`${TEST_HISTORIES_BASE_URL}/receptive`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
};

export const getAIFeedback = async ({ id }) => {
  return apiFetch(`${TEST_AI_FEEDBACK_URL}/writing`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      productive_test_history_id: id,
    }),
export const submitReceptiveTest = async (data, token) => {
  return apiFetch(`${TEST_HISTORIES_BASE_URL}/receptive`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
};

export const getReceptiveTestHistory = async (history_id, token) => {
  return apiFetch(`${TEST_HISTORIES_BASE_URL}/receptive/${history_id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
};
