import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';

export const api = axios.create({ baseURL });

/**
 * The AuthContext registers a provider that returns the current auth headers
 * (Bearer token in real Firebase mode, or x-dev-* headers in dev mode).
 */
let authHeaderProvider = async () => ({});

export function setAuthHeaderProvider(fn) {
  authHeaderProvider = fn;
}

api.interceptors.request.use(async (config) => {
  try {
    const headers = await authHeaderProvider();
    Object.assign(config.headers, headers);
  } catch {
    /* unauthenticated request */
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const message =
      error.response?.data?.error?.message ||
      error.response?.data?.error ||
      error.message ||
      'Request failed';
    return Promise.reject(new Error(message));
  }
);

// Convenience: unwrap the { success, data, error } envelope.
export async function apiGet(url, config) {
  const res = await api.get(url, config);
  return res.data.data;
}
export async function apiPost(url, body, config) {
  const res = await api.post(url, body, config);
  return res.data.data;
}
export async function apiPatch(url, body, config) {
  const res = await api.patch(url, body, config);
  return res.data.data;
}
export async function apiDelete(url, config) {
  const res = await api.delete(url, config);
  return res.data.data;
}
