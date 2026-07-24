import { createContext, useContext, useState, useCallback } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('finlit_user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback(async (email, password) => {
    const data = await api.login(email, password);
    api.setToken(data.token);
    localStorage.setItem('finlit_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (email, password, display_name) => {
    const data = await api.register(email, password, display_name);
    api.setToken(data.token);
    localStorage.setItem('finlit_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    api.setToken(null);
    localStorage.removeItem('finlit_user');
    setUser(null);
  }, []);

  // Called after a quiz submission awards XP/streak, so the header
  // updates instantly without a full refetch of the user record.
  const applyGamificationDelta = useCallback((xpAwarded, newStreak) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        xp_total: prev.xp_total + (xpAwarded || 0),
        streak_count: newStreak ?? prev.streak_count,
      };
      localStorage.setItem('finlit_user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, applyGamificationDelta }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
