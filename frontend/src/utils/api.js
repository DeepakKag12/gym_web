import axios from 'axios';

// Determine base URL:
// 1. If REACT_APP_API_URL is set in .env, use it.
// 2. In production builds, use same origin /api (works when backend serves the build).
// 3. Fall back to localhost for local dev.
const baseURL =
  process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api');

const API = axios.create({ baseURL });

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

// Catch HTML responses (e.g. 404 page returned instead of JSON)
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response) {
      const ct = err.response.headers['content-type'] || '';
      if (ct.includes('text/html')) {
        const htmlErr = new Error(
          `Server returned invalid JSON response. Status Code ${err.response.status}. ` +
          `Make sure the backend is running and REACT_APP_API_URL is set correctly.`
        );
        htmlErr.response = err.response;
        return Promise.reject(htmlErr);
      }
    }
    return Promise.reject(err);
  }
);

export default API;
