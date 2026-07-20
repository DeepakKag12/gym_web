import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import API from '../utils/api';
import { bustCache } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    // ── Step 1: Restore instantly from sessionStorage (survives refresh, cleared on tab close)
    const cached = sessionStorage.getItem('auth_user');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setUser(parsed);
        setLoading(false); // ← UI renders immediately, no black screen

        // ── Step 2: Silently re-validate token in background
        API.get('/auth/me')
          .then(res => {
            setUser(res.data);
            sessionStorage.setItem('auth_user', JSON.stringify(res.data));
          })
          .catch(() => {
            // Token expired or revoked — log out cleanly
            localStorage.removeItem('token');
            sessionStorage.removeItem('auth_user');
            setUser(null);
          });
        return;
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
      .catch(() => {
        localStorage.removeItem('token');
        sessionStorage.removeItem('auth_user');
      })
      .finally(() => {
        clearTimeout(timeout);
        setLoading(false);
      });
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await API.post('/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    sessionStorage.setItem('auth_user', JSON.stringify(res.data.user));
    // Clear any cached API responses that are user-specific
    bustCache('member');
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
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
