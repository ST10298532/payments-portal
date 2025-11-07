const BASE = 'http://localhost:4000'; // backend server

export async function apiFetch(path, { method = 'GET', body, accessToken, csrfToken } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
  if (csrfToken) headers['X-CSRF-Token'] = csrfToken;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include'
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw data;
  return data;
}
