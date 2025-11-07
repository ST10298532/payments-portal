const BASE = 'https://localhost:4001'; 

let csrfTokenCache = null;

// ✅ 1. Fetch CSRF token once and cache it
async function getCsrfToken() {
  if (csrfTokenCache) return csrfTokenCache;
  const res = await fetch(`${BASE}/csrf-token`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch CSRF token');
  const data = await res.json();
  csrfTokenCache = data.csrfToken; // adjust key name if backend returns differently
  return csrfTokenCache;
}

// ✅ 2. Universal API Fetch
export async function apiFetch(path, { method = 'GET', body, accessToken, csrfToken } = {}) {
  const headers = { 'Content-Type': 'application/json' };

  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

  // Automatically fetch & attach CSRF token for write requests
  if (['POST', 'PUT', 'DELETE'].includes(method.toUpperCase())) {
    const token = csrfToken || (await getCsrfToken());
    headers['X-CSRF-Token'] = token;
  }

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw data;
  return data;
}

// ✅ Employee routes (example usage)
export const getPendingPayments = async () => {
  return apiFetch('/api/employee/pending');
};

export const verifyPayment = async (tx_id) => {
  return apiFetch(`/api/employee/verify/${tx_id}`, { method: 'POST' });
};

export const submitToSwift = async () => {
  return apiFetch('/api/employee/submit', { method: 'POST' });
};
