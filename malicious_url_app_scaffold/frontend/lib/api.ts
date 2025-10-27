// lib/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000/api/v1',
  withCredentials: false,
});

export const urlCheckerApi = axios.create({
  baseURL: 'http://url-checker-service:8080',
});

// attach access token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const t = localStorage.getItem('token');
    if (t) config.headers.Authorization = `Bearer ${t}`;
  }
  return config;
});

// auto refresh on 401 once
let refreshing = false;
let waiters: Array<(t: string|null) => void> = [];

function onRefreshed(token: string|null) {
  waiters.forEach((cb) => cb(token));
  waiters = [];
}

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config;
    const status = error?.response?.status;

    if (status === 401 && !original._retry) {
      original._retry = true;

      if (!refreshing) {
        refreshing = true;
        const refresh = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
        try {
          const { data } = await axios.post(
            `${api.defaults.baseURL?.replace(/\/$/, '')}/token/refresh/`,
            { refresh }
          );
          localStorage.setItem('token', data.access);
          refreshing = false;
          onRefreshed(data.access);
        } catch {
          refreshing = false;
          onRefreshed(null);
        }
      }

      return new Promise((resolve, reject) => {
        waiters.push((newToken) => {
          if (!newToken) {
            // logout path
            if (typeof window !== 'undefined') {
              localStorage.removeItem('token');
              localStorage.removeItem('refreshToken');
            }
            return reject(error);
          }
          original.headers.Authorization = `Bearer ${newToken}`;
          resolve(axios(original));
        });
      });
    }

    return Promise.reject(error);
  }
);

export default api;
