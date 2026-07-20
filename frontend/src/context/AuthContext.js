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
    // Try to restore from sessionStorage first (survives page refresh, cleared on tab close)
    const cached = sessionStorage.getItem('auth_user');
    if (cached) {
      try {
        setUser(JSON.parse(cached));
        setLoading(false);
        // Re-validate in the background without blocking the UI
        API.get('/auth/me')
          .then(res => {
            setUser(res.data);
            sessionStorage.setItem('auth_user', JSON.stringify(res.data));
          })
          .catch(() => {
            localStorage.removeItem('token');
            sessionStorage.removeItem('auth_user');
            setUser(null);
          });
        return;
      } catch {
        sessionStorage.removeItem('auth_user');
      }
    }
    API.get('/auth/me')
      .then(res => {
        setUser(res.data);
        sessionStorage.setItem('auth_user', JSON.stringify(res.data));
      })
      .catch(() => {
        localStorage.removeItem('token');
        sessionStorage.removeItem('auth_user');
      })
      .finally(() => setLoading(false));
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
