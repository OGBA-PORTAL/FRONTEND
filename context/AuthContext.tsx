'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { User, UserRole } from '@/lib/types';

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (raNumber: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    hasRole: (...roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // Fetch current user on mount
    const fetchMe = useCallback(async () => {
        const storedToken = localStorage.getItem('token');
        if (!storedToken) {
            setIsLoading(false);
            return;
        }
        try {
            setToken(storedToken);
            const res = await api.get('/users/me');
            setUser(res.data.data.user);
        } catch {
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMe();
    }, [fetchMe]);

    const login = async (raNumber: string, password: string) => {
        const res = await api.post('/auth/login', { raNumber, password });
        const { token: newToken, data } = res.data;

        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(data.user);

        // Role-based redirect
        const role = data.user.role as UserRole;
        if (role === 'SYSTEM_ADMIN' || role === 'ASSOCIATION_OFFICER') {
            router.push('/dashboard/admin');
        } else {
            router.push('/dashboard/student');
        }
    };

    const logout = async () => {
        try {
            await api.get('/auth/logout');
        } catch { /* ignore */ }
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        router.push('/login');
    };

    const hasRole = (...roles: UserRole[]) => {
        return user ? roles.includes(user.role) : false;
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            isLoading,
            isAuthenticated: !!user,
            login,
            logout,
            hasRole
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
