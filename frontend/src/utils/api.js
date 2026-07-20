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
// Keyed by full URL + token presence. TTL defaults to 60 s.
// bustCache() immediately expires all matching keys so the very next
// cachedGet() skips the cache and fetches fresh from the network.
const _clientCache = new Map();

function _cacheKey(url) {
  const auth = localStorage.getItem('token') ? '1' : '0';
  return `get:${url}:${auth}`;
}

/**
 * cachedGet(url, config)
 * Returns cached data if still fresh, otherwise fetches from network.
 * config.cache = TTL in seconds (default 60). Set cache:0 to always fetch fresh.
 */
export async function cachedGet(url, config = {}) {
  const ttl = typeof config.cache === 'number' ? config.cache : 60;
  if (ttl === 0) return API.get(url, config);

  const key   = _cacheKey(url);
  const entry = _clientCache.get(key);
  const now   = Date.now();

  if (entry && now < entry.expiresAt) {
    return entry.promise;
  }
  // Kick off fresh request and store it
  const promise = API.get(url, config);
  _clientCache.set(key, { promise, expiresAt: now + ttl * 1000 });
  // On error: remove so the next call retries
  promise.catch(() => _clientCache.delete(key));
  return promise;
}

/**
 * bustCache(pattern)
 * Immediately expires all cache entries whose key contains `pattern`.
 * The next cachedGet() for those URLs will always hit the network.
 */
export function bustCache(pattern) {
  for (const [key, entry] of _clientCache.entries()) {
    if (key.includes(pattern)) {
      // Expire immediately — don't delete so in-flight promises still resolve
      entry.expiresAt = 0;
    }
  }
}

/**
 * freshGet(url, config)
 * Always bypasses cache and fetches from network (for use after mutations).
 * Also busts any existing cache entry for this URL.
 */
export async function freshGet(url, config = {}) {
  bustCache(url);
  const promise = API.get(url, config);
  const key = _cacheKey(url);
  _clientCache.set(key, { promise, expiresAt: Date.now() + ((config.cache ?? 60) * 1000) });
  promise.catch(() => _clientCache.delete(key));
  return promise;
}

export default API;
