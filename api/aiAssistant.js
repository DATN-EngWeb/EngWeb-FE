/* eslint-env browser */
/* global URLSearchParams */
import { apiFetch } from './client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
if (!API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_BASE_URL is required but not set in .env');
}
const AI_BASE_URL = `${API_BASE_URL.replace(/\/$/, '')}/api/assistant`;

export const getQuota = async () => {
  return apiFetch(`${AI_BASE_URL}/quota`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const getConversations = async () => {
  return apiFetch(`${AI_BASE_URL}/conversations`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const getConversationMessages = async (conversationId, { limit, beforeId } = {}) => {
  const searchParams = new URLSearchParams();

  if (limit != null) searchParams.set('limit', limit);
  if (beforeId != null) searchParams.set('before_id', limit);

  const queryString = searchParams.toString();

  return apiFetch(
    `${AI_BASE_URL}/conversations/${conversationId}${queryString ? `?${queryString}` : ''}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
};

export const startConversation = async ({ title, mode, level }) => {
  return apiFetch(`${AI_BASE_URL}/conversations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title, mode, level }),
  });
};

export const sendConversationMessage = async ({ conversationId, message, mode, context }) => {
  return apiFetch(`${AI_BASE_URL}/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      mode,
      context,
    }),
  });
};

export const renameConversation = async ({ conversationId, title }) => {
  return apiFetch(`${AI_BASE_URL}/conversations/${conversationId}/rename`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title }),
  });
};

export const archiveConversation = async (conversationId) => {
  return apiFetch(`${AI_BASE_URL}/conversations/${conversationId}/archive`, {
    method: 'DELETE',
  });
};
