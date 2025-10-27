import React, {createContext, useContext, useEffect, useState} from 'react';
import api from '../lib/api';

type User = { id: number; username: string } | null;
type Ctx = {
  user: User;
  login: (u: string, p: string) => Promise<void>;
  logout: () => void;
  register: (u: string, p1: string, p2: string) => Promise<void>;
};
const AuthContext = createContext<Ctx>(null as unknown as Ctx);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [user, setUser] = useState<User>(null);

  useEffect(() => {
    const t = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!t) return;
    api.get('/me/').then(r => setUser(r.data)).catch(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    });
  }, []);

  const login = async (username: string, password: string) => {
    const { data } = await api.post('/token/', { username, password });
    localStorage.setItem('token', data.access);
    localStorage.setItem('refreshToken', data.refresh);
    const me = await api.get('/me/');
    setUser(me.data);
  };

  const register = async (username: string, password1: string, password2: string) => {
    await api.post('/register/', { username, password: password1, password2 });
    await login(username, password1);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() { return useContext(AuthContext); }   // named export
export default useAuth;                                         // default export too (either import style will work)