/**
 * Decode the JWT stored in localStorage (no library needed — just base64)
 * Returns the payload or null if no token / invalid
 */
export function getTokenPayload() {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

export function getCurrentUserId() {
  return getTokenPayload()?.userId ?? null;
}
