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

// ── Client-side in-memory cache ────────────────────────────────────────────────
// Only caches safe GET requests. Keyed by full URL + token presence.
// TTL defaults to 60 s; callers can override via { cache: ttlSeconds } in config.
const _clientCache = new Map();

function _cacheKey(config) {
  const auth = localStorage.getItem('token') ? '1' : '0';
  return `${config.method || 'get'}:${config.url}:${JSON.stringify(config.params || {})}:${auth}`;
}

function _isCacheable(config) {
  return (config.method || 'get').toLowerCase() === 'get' && config.cache !== false;
}

/**
 * cachedGet(url, config)
 * Like API.get() but returns a stale-while-revalidate promise.
 * config.cache = TTL in seconds (default 60). Set to false to skip cache.
 */
export async function cachedGet(url, config = {}) {
  if (!_isCacheable({ ...config, method: 'get' })) {
    return API.get(url, config);
  }
  const ttl = typeof config.cache === 'number' ? config.cache : 60;
  const key = _cacheKey({ ...config, method: 'get', url });
  const entry = _clientCache.get(key);
  const now = Date.now();

  if (entry && now < entry.expiresAt) {
    return entry.promise;
  }
  // Kick off fresh request and cache the promise
  const promise = API.get(url, config);
  _clientCache.set(key, { promise, expiresAt: now + ttl * 1000 });
  // On error remove from cache so the next call retries
  promise.catch(() => _clientCache.delete(key));
  return promise;
}

/** Purge all client-side cache entries whose key contains the given pattern. */
export function bustCache(pattern) {
  for (const key of _clientCache.keys()) {
    if (key.includes(pattern)) _clientCache.delete(key);
  }
}

export default API;
