/* eslint-env browser */
/* global fetch, Blob */
import { apiFetch } from '../client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
if (!API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_BASE_URL is required but not set in .env');
}

const TESTS_BASE_URL = `${API_BASE_URL.replace(/\/$/, '')}/api/tests`;

export async function createNewTest(testData) {
  return apiFetch(`${TESTS_BASE_URL}/overview`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(testData),
    cache: 'no-store',
  });
}

export async function uploadReadingTestContent(testId, partsData) {
  const bodyPayload = {
    data: {
      parts: partsData,
    },
  };

  return apiFetch(`${TESTS_BASE_URL}/receptive/${testId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(bodyPayload),
    cache: 'no-store',
  });
}

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
  } catch (error) {
    console.error(`Lỗi tải nội dung từ: ${url}`, error);
    return '';
  }
};

export async function updateReadingTestContent(testId, updatePayload) {
  return apiFetch(`${TESTS_BASE_URL}/full-test/receptive/${testId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updatePayload),
    cache: 'no-store',
  });
}

export const loadAudioSource = async (url) => {
  if (!url || typeof url !== 'string' || !url.startsWith('http')) {
    return url;
  }

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Không thể tải file âm thanh');

    const audioBlob = await response.blob();

    return URL.createObjectURL(audioBlob);
  } catch (error) {
    console.error(`Lỗi xử lý audio từ: ${url}`, error);
    return null;
  }
};

export const loadImageSource = async (url) => {
  if (!url || typeof url !== 'string' || !url.startsWith('http')) {
    return url;
  }

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Lỗi HTTP: ${response.status}`);
    }

    const imageBlob = await response.blob();

    return URL.createObjectURL(imageBlob);
  } catch (error) {
    console.error(`Lỗi xử lý hình ảnh từ: ${url}`, error);
    return null;
  }
};
