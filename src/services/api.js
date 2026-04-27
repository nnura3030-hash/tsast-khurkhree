import axios from 'axios';

const normalizeUrl = (value = "") => value.replace(/\/+$/, "");
const isProd = import.meta.env.PROD;
const defaultApiBase = isProd ? window.location.origin : "http://localhost:5000";
const apiBaseURL = normalizeUrl(import.meta.env.VITE_API_URL || defaultApiBase).replace(
  /\/api\/?$/,
  ""
);

const api = axios.create({
  baseURL: apiBaseURL,
});

// Хүсэлт бүрт токен автоматаар нэмэх тохиргоо
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Алдааг глобал байдлаар барих
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
