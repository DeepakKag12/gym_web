import axios from 'axios';

/**
 * Where the API lives.
 *
 * REACT_APP_API_URL is baked in at build time. When a build ran without it, the
 * old fallback in production was same-origin '/api' — which the static host
 * rewrites to index.html, so the app called ITSELF, got HTML back, and every
 * screen said "invalid JSON response". One of the two Vercel projects serving
 * this site was built exactly that way, which is why it worked on some phones
 * and not others: it depended on which address had been bookmarked.
 *
 * The backend is a single known deployment, so a production build now defaults
 * to it. The env var still wins when set, so a staging backend is one variable
 * away — but forgetting it can no longer produce a site that cannot load.
 */
const PRODUCTION_API = 'https://g-ym-backend.vercel.app/api';

const baseURL =
  process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === 'production' ? PRODUCTION_API : 'http://localhost:5000/api');

if (process.env.NODE_ENV === 'production' && !process.env.REACT_APP_API_URL) {
  // Visible in devtools on the deployment that forgot the variable, so the
  // misconfiguration is diagnosable instead of silently defaulted.
  console.warn(`REACT_APP_API_URL was not set at build time; using ${PRODUCTION_API}`);
}

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
    if (err.response?.status === 401) clearClientCache();
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
// TTL defaults to 60 s. bustCache() immediately expires all matching keys so
// the very next cachedGet() skips the cache and fetches fresh from the network.
const _clientCache = new Map();

/**
 * The key answers: "would the server give THIS caller the same bytes?"
 *
 * It used to be url + whether-a-token-exists. That let one person read
 * another's data: sign out as the admin, sign in as a member within the TTL on
 * the same tab, and the member was handed the admin's cached member list and
 * notifications — the promise was still fresh, so no request was made. Keying
 * on who the token belongs to closes that. The base URL is in the key too, so
 * a response from one backend can never be served as if it came from another.
 */
function _identity() {
  const token = localStorage.getItem('token');
  if (!token) return 'anon';
  // The JWT payload carries the user id; that is the identity, not the whole
  // token (which would make every re-login a cold cache for no reason).
  try { return JSON.parse(atob(token.split('.')[1])).id || 'user'; } catch { return 'user'; }
}

function _cacheKey(url) {
  return `get:${API.defaults.baseURL}:${url}:${_identity()}`;
}

/**
 * Drop everything. Called on sign-in, sign-out and any 401, because at each of
 * those moments every cached answer was for somebody else.
 */
export function clearClientCache() {
  _clientCache.clear();
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

/**
 * apiError(err, fallback) — one readable sentence for any failure.
 *
 * `err.response?.data?.message || 'Something failed'` was used everywhere, but
 * it collapses the two cases a user most needs told apart:
 *
 *   • the server answered and refused  -> show what it said ("Invalid credentials")
 *   • the request never arrived        -> the old code showed "Login failed",
 *     which sends someone hunting for a wrong password when the backend is
 *     actually down, blocked by CORS, or unreachable on this network.
 */
export function apiError(err, fallback = 'Something went wrong. Please try again.') {
  if (err?.response) {
    return err.response.data?.message || `${fallback} (server said ${err.response.status})`;
  }
  if (err?.code === 'ECONNABORTED') {
    return 'The server took too long to respond. Check your connection and try again.';
  }
  if (err?.request) {
    // No response at all: server down, wrong API URL, CORS, or offline.
    const base = API.defaults.baseURL;
    return `Cannot reach the server at ${base}. Make sure the backend is running and that this address is allowed.`;
  }
  return err?.message || fallback;
}
