import { useMutation } from '@tanstack/react-query';
import { useConvex } from 'convex/react';
import { useAuthStore } from '@/app/store/authStore';
import { useNavigate } from 'react-router';
import { anyApi } from 'convex/server';
import { useAuthManager } from './useAuthManager';

// Conditional import to handle development
// let api: any;
// try {
//     api = require('@/convex/_generated/api').api;
// } catch (error) {
//     console.log('Convex API not generated yet. Run: npx convex dev');
// }

export function useAuth() {
    const convex = useConvex();
    const navigate = useNavigate();
    const { login: setAuth, isAuthenticated, admin } = useAuthStore();
    const { login: authManagerLogin, logout: authManagerLogout } = useAuthManager();

    const loginMutation = useMutation({
        mutationFn: async ({ email, password }: { email: string; password: string }) => {
            if (!anyApi) {
                throw new Error('Convex not initialized. Run: npx convex dev');
            }

            const result = await convex.query(anyApi.admin.authenticateAdmin, { email, password });
            if (!result) {
                throw new Error('Invalid credentials');
            }
            return result;
        },
        onSuccess: (adminData) => {
            // setAuth(adminData);
            // navigate('/admin/dashboard');
            setAuth(adminData);
            authManagerLogin(adminData); // Initialize session management
        },
        onError: (error) => {
            console.error('Login error:', error);
        },
    });

    const logout = () => {
        // navigate('/admin/login', { replace: true });
        authManagerLogout()
    };

    return {
        admin,
        isAuthenticated,
        login: loginMutation.mutateAsync, // Use mutateAsync for promise handling
        logout,
        isLoading: loginMutation.isPending,
        error: loginMutation.error,
    };
}