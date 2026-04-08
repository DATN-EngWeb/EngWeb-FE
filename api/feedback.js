/* global URLSearchParams */
import { apiFetch } from './client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
if (!API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_BASE_URL is required but not set in .env');
}
const FEEDBACK_BASE_URL = `${API_BASE_URL.replace(/\/$/, '')}/api/feedback`;

export const getTestFeedbacks = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return apiFetch(`${FEEDBACK_BASE_URL}/test-feedbacks?${query}`, {
    method: 'GET',
  });
};

export const createTestFeedback = async ({ test_id, comment }) => {
  return apiFetch(`${FEEDBACK_BASE_URL}/test-feedbacks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ test_id, comment }),
  });
};

export const updateTestFeedback = async ({ feedback_id, comment }) => {
  return apiFetch(`${FEEDBACK_BASE_URL}/test-feedbacks/${feedback_id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ comment }),
  });
};

export const deleteTestFeedback = async (feedback_id) => {
  return apiFetch(`${FEEDBACK_BASE_URL}/test-feedbacks/${feedback_id}`, {
    method: 'DELETE',
  });
};

export const generateAIReadingFeedback = async ({ test_id, pdf_gcs_uri }) => {
  return apiFetch(`${FEEDBACK_BASE_URL}/ai-feedback/reading`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ test_id, pdf_gcs_uri }),
  });
};
