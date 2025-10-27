import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import axios from 'axios';

type User = { username: string } | null;

interface AuthContextType {
  user: User;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, password2: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [token, setToken] = useState<string | null>(null);

  const API_BASE =
    typeof window !== 'undefined'
      ? process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000'
      : process.env.SERVER_API_BASE || 'http://backend:8000';

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('token');
    if (saved) {
      setToken(saved);
      axios.defaults.headers.common['Authorization'] = `Bearer ${saved}`;
      const savedUser = localStorage.getItem('user');
      if (savedUser) setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (username: string, password: string) => {
    const res = await axios.post(`${API_BASE}/api/token/`, { username, password });
    const access = res.data.access as string;
    setToken(access);
    setUser({ username });
    axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
    localStorage.setItem('token', access);
    localStorage.setItem('user', JSON.stringify({ username }));
  };

  const register = async (username: string, password: string, password2: string) => {
    const payload = { username, password, password2 };

    let res = await axios.post(`${API_BASE}/api/v1/register/`, payload, { validateStatus: () => true });
    if (res.status === 404) {
      res = await axios.post(`${API_BASE}/api/register/`, payload, { validateStatus: () => true });
    }

    if (res.status >= 200 && res.status < 300) {
      const access = res.data.access as string;
      const uname = res.data.username || username;
      setToken(access);
      setUser({ username: uname });
      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      localStorage.setItem('token', access);
      localStorage.setItem('user', JSON.stringify({ username: uname }));
      return;
    }

    const reasons = Array.isArray(res.data?.reasons) ? `: ${res.data.reasons.join(', ')}` : '';
    const msg = res.data?.error || res.data?.detail || `HTTP ${res.status}`;
    throw { response: { status: res.status, data: { error: msg + reasons } } };
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    delete axios.defaults.headers.common['Authorization'];
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}