import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import API from '../utils/api';

// Helper to create a fake valid JWT with base64 payload
function createFakeJwt(payload) {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.signature`;
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    jest.restoreAllMocks();
  });

  test('defaults to null user and loading false when no token exists', async () => {
    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.loading).toBe(false);
    expect(result.current.user).toBeNull();
  });

  test('restores user instantly from sessionStorage when valid token exists', async () => {
    const user = { _id: 'u1', name: 'Existing Member', role: 'member' };
    const token = createFakeJwt({ id: 'u1', exp: Math.floor(Date.now() / 1000) + 3600 });
    localStorage.setItem('token', token);
    sessionStorage.setItem('auth_user', JSON.stringify(user));

    // Background /auth/me call
    jest.spyOn(API, 'get').mockResolvedValue({ data: user });

    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    // Instant restore
    expect(result.current.loading).toBe(false);
    expect(result.current.user).toEqual(user);

    await waitFor(() => {
      expect(result.current.user).toEqual(user);
    });
  });

  test('logs out and clears storage when background /auth/me returns 401 (token expired/revoked)', async () => {
    const user = { _id: 'u1', name: 'Existing Member', role: 'member' };
    const token = createFakeJwt({ id: 'u1', exp: Math.floor(Date.now() / 1000) + 3600 });
    localStorage.setItem('token', token);
    sessionStorage.setItem('auth_user', JSON.stringify(user));

    const err401 = new Error('Unauthorized');
    err401.response = { status: 401, data: { message: 'Token expired' } };
    jest.spyOn(API, 'get').mockRejectedValue(err401);

    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    // Initially restored
    expect(result.current.user).toEqual(user);

    // After background revalidation fails with 401
    await waitFor(() => {
      expect(result.current.user).toBeNull();
    });

    expect(localStorage.getItem('token')).toBeNull();
    expect(sessionStorage.getItem('auth_user')).toBeNull();
  });

  test('does not log out user on temporary network error (e.g. offline / 500) during background revalidation', async () => {
    const user = { _id: 'u1', name: 'Existing Member', role: 'member' };
    const token = createFakeJwt({ id: 'u1', exp: Math.floor(Date.now() / 1000) + 3600 });
    localStorage.setItem('token', token);
    sessionStorage.setItem('auth_user', JSON.stringify(user));

    // Simulate network error (no response object or 500 status)
    const netErr = new Error('Network Error');
    netErr.code = 'ECONNABORTED';
    jest.spyOn(API, 'get').mockRejectedValue(netErr);

    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    // User should remain logged in
    await act(async () => {
      await new Promise(r => setTimeout(r, 50));
    });

    expect(result.current.user).toEqual(user);
    expect(localStorage.getItem('token')).toBe(token);
  });

  test('login sets user, stores token in localStorage, and populates sessionStorage', async () => {
    const loggedInUser = { _id: 'u2', name: 'Jane Admin', role: 'admin' };
    const token = createFakeJwt({ id: 'u2' });

    jest.spyOn(API, 'post').mockResolvedValue({
      data: { token, user: loggedInUser },
    });

    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      const u = await result.current.login('admin@fitnation.com', 'password123');
      expect(u).toEqual(loggedInUser);
    });

    expect(result.current.user).toEqual(loggedInUser);
    expect(localStorage.getItem('token')).toBe(token);
    expect(JSON.parse(sessionStorage.getItem('auth_user'))).toEqual(loggedInUser);
  });

  test('logout removes token, clears sessionStorage, and sets user to null', async () => {
    const user = { _id: 'u3', name: 'Bob', role: 'member' };
    localStorage.setItem('token', 'some-token');
    sessionStorage.setItem('auth_user', JSON.stringify(user));

    jest.spyOn(API, 'get').mockResolvedValue({ data: user });

    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
    expect(sessionStorage.getItem('auth_user')).toBeNull();
  });

  test('prevents restoring stale session if token payload id does not match cached auth_user id', async () => {
    // Token belongs to user "u_alpha"
    const token = createFakeJwt({ id: 'u_alpha', exp: Math.floor(Date.now() / 1000) + 3600 });
    localStorage.setItem('token', token);
    // Cached session in sessionStorage belongs to old user "u_beta"
    const staleUser = { _id: 'u_beta', name: 'Stale User' };
    sessionStorage.setItem('auth_user', JSON.stringify(staleUser));

    const realUser = { _id: 'u_alpha', name: 'Alpha User' };
    jest.spyOn(API, 'get').mockResolvedValue({ data: realUser });

    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    // Should NOT restore staleUser immediately
    expect(result.current.user?._id).not.toBe('u_beta');

    await waitFor(() => {
      expect(result.current.user).toEqual(realUser);
    });
  });
});
