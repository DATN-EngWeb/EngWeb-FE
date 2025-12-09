/* global atob */
// Decode JWT payload safely on the client (no signature verification)
export function decodeJwt(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const payload = atob(parts[1]);
    return JSON.parse(payload);
  } catch (_e) {
    return null;
  }
}
