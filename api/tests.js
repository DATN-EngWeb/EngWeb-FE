/* global URLSearchParams */
import { apiFetch } from './client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
if (!API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_BASE_URL is required but not set in .env');
}
const TESTS_BASE_URL = `${API_BASE_URL.replace(/\/$/, '')}/api/tests`;

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

export async function getTestOverview(filters = {}) {
  const queryString = buildQueryString(filters);
  return apiFetch(`${TESTS_BASE_URL}/overview${queryString}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });
}

export async function createTest(testData) {
  return apiFetch(`${TESTS_BASE_URL}/overview`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(testData),
    cache: 'no-store',
  });
}

export async function createReceptiveTest(testId, testData) {
  return apiFetch(`${TESTS_BASE_URL}/receptive/${testId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(testData),
    cache: 'no-store',
  });
}

export async function createProductiveTest(testId, testData) {
  return apiFetch(`${TESTS_BASE_URL}/productive/${testId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(testData),
    cache: 'no-store',
  });
}

export async function getFullReceptiveTest(testId) {
  return apiFetch(`${TESTS_BASE_URL}/full-test/receptive/${testId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });
}

export async function getFullProductiveTest(testId) {
  return apiFetch(`${TESTS_BASE_URL}/full-test/productive/${testId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });
}

export async function getWritingCriteria() {
  return apiFetch(`${TESTS_BASE_URL}/writing-criteria`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });
}

export async function getCompletedBonus() {
  return apiFetch(`${TESTS_BASE_URL}/completed-bonus`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });
}
