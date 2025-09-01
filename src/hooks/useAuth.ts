import { useConvex } from 'convex/react';
import { useAuthStore } from '@/app/store/authStore';
import { useNavigate } from 'react-router';
import { api } from '../../convex/_generated/api';
import { useAuthManager } from './useAuthManager';
import { useState } from 'react';

export function useAuth() {
    const convex = useConvex();
    const navigate = useNavigate();
    const { login: setAuth, isAuthenticated, admin } = useAuthStore();
    const { login: authManagerLogin, logout: authManagerLogout } = useAuthManager();

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const login = async ({ email, password }: { email: string; password: string }) => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await convex.query(api.admin.authenticateAdmin, { email, password });
            if (!result) {
                throw new Error('Invalid credentials');
            }

            setAuth(result);
            authManagerLogin(result);
            navigate('/admin/dashboard');
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Login failed');
            setError(error);
            authManagerLogout();
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        authManagerLogout();
    };

    return {
        admin,
        isAuthenticated,
        login,
        logout,
        isLoading,
        error,
    };
}