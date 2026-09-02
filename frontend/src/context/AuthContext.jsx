import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/auth';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('zenkai_token'));
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchCurrentUser = useCallback(async () => {
    const storedToken = localStorage.getItem('zenkai_token');
    if (!storedToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await authApi.getMe();
      if (response.success && response.data?.user) {
        setUser(response.data.user);
      } else {
        localStorage.removeItem('zenkai_token');
        setToken(null);
        setUser(null);
      }
    } catch (err) {
      console.warn('Session verification failed, logging out:', err.message);
      localStorage.removeItem('zenkai_token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (credentials) => {
    try {
      const response = await authApi.login(credentials);
      if (response.success && response.data?.token) {
        localStorage.setItem('zenkai_token', response.data.token);
        setToken(response.data.token);
        setUser(response.data.user);
        toast.success(`Welcome back, ${response.data.user.displayName || response.data.user.username}!`);
        return { success: true };
      }
      return { success: false, message: response.message || 'Login failed' };
    } catch (error) {
      toast.error(error.message || 'Invalid credentials');
      return { success: false, message: error.message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authApi.register(userData);
      if (response.success && response.data?.token) {
        localStorage.setItem('zenkai_token', response.data.token);
        setToken(response.data.token);
        setUser(response.data.user);
        toast.success(`Account created! Welcome to Zenkai, ${response.data.user.username}!`);
        return { success: true };
      }
      return { success: false, message: response.message || 'Registration failed' };
    } catch (error) {
      toast.error(error.message || 'Registration failed');
      return { success: false, message: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('zenkai_token');
    setToken(null);
    setUser(null);
    toast.info('You have been logged out.');
  };

  const demoLogin = async (accountType = 'demo') => {
    const demoAccounts = {
      demo: { email: 'demo@zenkai.dev', password: 'password123' },
      sakura: { email: 'sakura@zenkai.dev', password: 'password123' },
      master: { email: 'master@zenkai.dev', password: 'password123' },
    };

    const credentials = demoAccounts[accountType] || demoAccounts.demo;
    return login(credentials);
  };

  const updateCurrentUser = (updatedUser) => {
    setUser((prev) => ({ ...prev, ...updatedUser }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        demoLogin,
        updateCurrentUser,
        refreshUser: fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
