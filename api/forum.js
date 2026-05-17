/* global URLSearchParams */
import { apiFetch } from './client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
if (!API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_BASE_URL is required but not set in .env');
}
const FORUM_BASE_URL = `${API_BASE_URL.replace(/\/$/, '')}/api/forums`;

export const createPost = async (request) => {
  return apiFetch(`${FORUM_BASE_URL}/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });
};

export const getPosts = async (params = {}) => {
  const query = new URLSearchParams(params).toString();

  const url = query ? `${FORUM_BASE_URL}/posts?${query}` : `${FORUM_BASE_URL}/posts`;

  return apiFetch(url, {
    method: 'GET',
  });
};

export const editPost = async (payload, postId) => {
  return apiFetch(`${FORUM_BASE_URL}/posts/${postId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const deletePost = async (postId) => {
  return apiFetch(`${FORUM_BASE_URL}/posts/${postId}`, {
    method: 'DELETE',
  });
};

export const reactToPost = async (postId) => {
  return apiFetch(`${FORUM_BASE_URL}/reactions/${postId}`, {
    method: 'POST',
  });
};

export const getComments = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const url = query ? `${FORUM_BASE_URL}/comments?${query}` : `${FORUM_BASE_URL}/comments`;
  return apiFetch(url, { method: 'GET' });
};

export const createComment = async (content) => {
  return apiFetch(`${FORUM_BASE_URL}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(content),
  });
};

export const editComment = async (payload, commentId) => {
  return apiFetch(`${FORUM_BASE_URL}/comments/${commentId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const deleteComment = async (commentId) => {
  return apiFetch(`${FORUM_BASE_URL}/comments/${commentId}`, {
    method: 'DELETE',
  });
};
