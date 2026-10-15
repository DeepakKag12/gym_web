import API, {
  cachedGet,
  freshGet,
  bustCache,
  clearClientCache,
  apiError,
} from '../utils/api';

// Helper to create a fake JWT with base64 payload
function createFakeJwt(payload) {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.signature`;
}

describe('API client and client-side cache', () => {
  beforeEach(() => {
    localStorage.clear();
    clearClientCache();
    jest.restoreAllMocks();
  });

  describe('Authorization header and interceptors', () => {
    test('attaches Authorization header when token exists in localStorage', () => {
      localStorage.setItem('token', 'my-test-token');

      const requestInterceptor = API.interceptors.request.handlers[0].fulfilled;
      const config = requestInterceptor({ headers: {} });

      expect(config.headers.Authorization).toBe('Bearer my-test-token');
    });

    test('omits Authorization header when no token exists in localStorage', () => {
      const requestInterceptor = API.interceptors.request.handlers[0].fulfilled;
      const config = requestInterceptor({ headers: {} });

      expect(config.headers.Authorization).toBeUndefined();
    });

    test('clears client cache when server returns 401 Unauthorized', async () => {
      const getSpy = jest.spyOn(API, 'get').mockResolvedValueOnce({ data: { items: [1, 2] } });
      await cachedGet('/items');
      expect(getSpy).toHaveBeenCalledTimes(1);

      // Trigger 401 error through interceptor
      const err = new Error('Unauthorized');
      err.response = { status: 401, headers: {} };

      const errorHandler = API.interceptors.response.handlers[0].rejected;
      await expect(errorHandler(err)).rejects.toThrow();

      // Clear mock call history
      getSpy.mockClear();

      // Verify cache was cleared: subsequent cachedGet triggers a fresh network call
      getSpy.mockResolvedValueOnce({ data: { items: [3, 4] } });
      const freshRes = await cachedGet('/items');
      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(freshRes.data.items).toEqual([3, 4]);
    });

    test('transforms HTML response on error into a readable diagnostic error', async () => {
      const err = new Error('Request failed with status code 404');
      err.response = {
        status: 404,
        headers: { 'content-type': 'text/html; charset=utf-8' },
        data: '<!DOCTYPE html><html><body>Cannot GET /api/missing</body></html>',
      };

      const errorHandler = API.interceptors.response.handlers[0].rejected;
      await expect(errorHandler(err)).rejects.toThrow(
        /Server returned invalid JSON response\. Status Code 404/
      );
    });
  });

  describe('cachedGet, freshGet, and bustCache', () => {
    test('serves subsequent calls from memory within TTL without second network request', async () => {
      const getSpy = jest.spyOn(API, 'get').mockResolvedValue({ data: { count: 42 } });

      const res1 = await cachedGet('/analytics/stats', { cache: 60 });
      const res2 = await cachedGet('/analytics/stats', { cache: 60 });

      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(res1.data.count).toBe(42);
      expect(res2.data.count).toBe(42);
    });

    test('bypasses cache when cache: 0 is specified', async () => {
      const getSpy = jest.spyOn(API, 'get')
        .mockResolvedValueOnce({ data: { val: 1 } })
        .mockResolvedValueOnce({ data: { val: 2 } });

      const res1 = await cachedGet('/live-data', { cache: 0 });
      const res2 = await cachedGet('/live-data', { cache: 0 });

      expect(getSpy).toHaveBeenCalledTimes(2);
      expect(res1.data.val).toBe(1);
      expect(res2.data.val).toBe(2);
    });

    test('bustCache expires matching cached endpoints immediately', async () => {
      const getSpy = jest.spyOn(API, 'get')
        .mockResolvedValueOnce({ data: { members: ['m1'] } })
        .mockResolvedValueOnce({ data: { members: ['m1', 'm2'] } });

      await cachedGet('/members', { cache: 60 });
      expect(getSpy).toHaveBeenCalledTimes(1);

      // Bust cache for 'members'
      bustCache('members');

      const res2 = await cachedGet('/members', { cache: 60 });
      expect(getSpy).toHaveBeenCalledTimes(2);
      expect(res2.data.members).toEqual(['m1', 'm2']);
    });

    test('freshGet invalidates existing entry and fetches directly from network', async () => {
      const getSpy = jest.spyOn(API, 'get')
        .mockResolvedValueOnce({ data: { val: 'old' } })
        .mockResolvedValueOnce({ data: { val: 'new' } });

      await cachedGet('/settings', { cache: 60 });

      const freshRes = await freshGet('/settings');
      expect(getSpy).toHaveBeenCalledTimes(2);
      expect(freshRes.data.val).toBe('new');
    });

    test('removes failed request from cache so subsequent call retries', async () => {
      const getSpy = jest.spyOn(API, 'get')
        .mockRejectedValueOnce(new Error('Network fail'))
        .mockResolvedValueOnce({ data: { ok: true } });

      await expect(cachedGet('/unstable')).rejects.toThrow('Network fail');

      const retryRes = await cachedGet('/unstable');
      expect(getSpy).toHaveBeenCalledTimes(2);
      expect(retryRes.data.ok).toBe(true);
    });
  });

  describe('Identity partitioning (prevents cross-user cache leakage)', () => {
    test('partitions cache keys by active user JWT id', async () => {
      const tokenUserA = createFakeJwt({ id: 'user_A' });
      const tokenUserB = createFakeJwt({ id: 'user_B' });

      const getSpy = jest.spyOn(API, 'get')
        .mockResolvedValueOnce({ data: { role: 'admin', profile: 'User A Profile' } })
        .mockResolvedValueOnce({ data: { role: 'member', profile: 'User B Profile' } });

      // User A logs in
      localStorage.setItem('token', tokenUserA);
      const resA = await cachedGet('/profile', { cache: 60 });
      expect(resA.data.profile).toBe('User A Profile');

      // User B logs in without clearClientCache — identity keying prevents serving User A's data
      localStorage.setItem('token', tokenUserB);
      const resB = await cachedGet('/profile', { cache: 60 });
      expect(resB.data.profile).toBe('User B Profile');

      expect(getSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('LRU eviction cap (MAX_CLIENT_CACHE_ENTRIES = 100)', () => {
    test('evicts oldest entries when cache size exceeds 100', async () => {
      const getSpy = jest.spyOn(API, 'get').mockImplementation((url) => Promise.resolve({ data: { url } }));

      // Populate 105 distinct URLs
      for (let i = 1; i <= 105; i++) {
        await cachedGet(`/route-${i}`, { cache: 60 });
      }

      // Reset mock counter
      getSpy.mockClear();

      // The first entry (/route-1) should have been evicted by LRU
      getSpy.mockResolvedValueOnce({ data: { url: '/route-1-fresh' } });
      const res = await cachedGet('/route-1', { cache: 60 });

      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(res.data.url).toBe('/route-1-fresh');

      // The recent entry (/route-105) should still be cached
      getSpy.mockClear();
      const res105 = await cachedGet('/route-105', { cache: 60 });
      expect(getSpy).toHaveBeenCalledTimes(0);
      expect(res105.data.url).toBe('/route-105');
    });
  });

  describe('apiError helper', () => {
    test('formats error response message from server response data', () => {
      const err = { response: { status: 400, data: { message: 'Email already registered' } } };
      expect(apiError(err)).toBe('Email already registered');
    });

    test('formats status code fallback when response has no message', () => {
      const err = { response: { status: 500, data: {} } };
      expect(apiError(err, 'Failed to save')).toBe('Failed to save (server said 500)');
    });

    test('formats timeout error', () => {
      const err = { code: 'ECONNABORTED' };
      expect(apiError(err)).toContain('The server took too long to respond');
    });

    test('formats unreachable server error when request exists without response', () => {
      const err = { request: {} };
      expect(apiError(err)).toContain('Cannot reach the server');
    });

    test('falls back to err.message or provided fallback string', () => {
      expect(apiError(new Error('Custom error'))).toBe('Custom error');
      expect(apiError(null, 'Custom fallback')).toBe('Custom fallback');
    });
  });
});
