import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface AuthContextType {
    user: any; // Replace 'any' with your user type
    token: string | null;
    login: (username: string, password: string) => Promise<void>;
    register: (username: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
            axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
            // You might want to fetch user data here as well
        }
    }, []);

    const login = async (username: string, password: string) => {
        try {
            const response = await axios.post('http://localhost:8000/api/token/', { username, password });
            const { access } = response.data;
            setToken(access);
            axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
            localStorage.setItem('token', access);
            // Fetch user data if needed
        } catch (error) {
            console.error('Login failed', error);
            throw error;
        }
    };

    const register = async (username: string, password: string) => {
        try {
            await axios.post('http://localhost:8000/api/v1/register/', { username, password });
        } catch (error) {
            console.error('Registration failed', error);
            throw error;
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        delete axios.defaults.headers.common['Authorization'];
        localStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext) as AuthContextType;
