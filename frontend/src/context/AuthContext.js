import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import API from '../utils/api';
import { bustCache, clearClientCache } from '../utils/api';

const AuthContext = createContext(null);

function decodeJwtPayload(token) {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    const payload = decodeJwtPayload(token);
    // If token has an exp claim and is already expired, clear immediately
    if (payload?.exp && Date.now() >= payload.exp * 1000) {
      localStorage.removeItem('token');
      clearClientCache();
      sessionStorage.removeItem('auth_user');
      setUser(null);
      setLoading(false);
      return;
    }

    // ── Step 1: Restore instantly from sessionStorage (survives refresh, cleared on tab close)
    const cached = sessionStorage.getItem('auth_user');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        // Only restore if the cached user matches the token identity
        const tokenUserId = payload?.id || payload?._id;
        if (!tokenUserId || !parsed?._id || tokenUserId === parsed._id) {
          setUser(parsed);
          setLoading(false); // ← UI renders immediately, no black screen

          // ── Step 2: Silently re-validate token in background
          API.get('/auth/me')
            .then(res => {
              setUser(res.data);
              sessionStorage.setItem('auth_user', JSON.stringify(res.data));
            })
            .catch(err => {
              // Token expired or revoked — log out cleanly only on 401/403
              if (err.response?.status === 401 || err.response?.status === 403) {
                localStorage.removeItem('token');
                clearClientCache();
                sessionStorage.removeItem('auth_user');
                setUser(null);
              }
              // Transient network errors or 5xx preserve existing cached session
            });
          return;
        } else {
          // Stale cache from different user — discard it
          sessionStorage.removeItem('auth_user');
        }
      } catch {
        sessionStorage.removeItem('auth_user');
      }
    }

    // ── Step 3: No cache — must call API (only on very first load after login on new device)
    // Set a 5s timeout so mobile users on bad networks don't get stuck on black screen forever
    const timeout = setTimeout(() => setLoading(false), 5000);
    API.get('/auth/me')
      .then(res => {
        setUser(res.data);
        sessionStorage.setItem('auth_user', JSON.stringify(res.data));
      })
      .catch(err => {
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem('token');
          clearClientCache();
          sessionStorage.removeItem('auth_user');
        }
      })
      .finally(() => {
        clearTimeout(timeout);
        setLoading(false);
      });
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await API.post('/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    clearClientCache(); // nothing cached before this moment belongs to this user
    sessionStorage.setItem('auth_user', JSON.stringify(res.data.user));
    // Clear any cached API responses that are user-specific
    bustCache('member');
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    clearClientCache();
    sessionStorage.removeItem('auth_user');
    bustCache('member');
    setUser(null);
  }, []);

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    sessionStorage.setItem('auth_user', JSON.stringify(updatedUser));
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, logout, updateUser }),
    [user, loading, login, logout, updateUser]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
