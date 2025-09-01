// src/hooks/useAuthManager.ts
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useAuthStore } from '@/app/store/authStore';
import { AuthManager } from '@/lib/authManager';

export function useAuthManager() {
    const navigate = useNavigate();
    const { logout: clearAuthState } = useAuthStore();
    const authManagerRef = useRef<AuthManager | null>(null);

    useEffect(() => {
        const authManager = AuthManager.getInstance();
        authManagerRef.current = authManager;

        const handleLogout = () => {
            clearAuthState();
            navigate('/admin/login', { replace: true });
        };

        // Initialize the auth manager
        authManager.initialize(handleLogout);

        return () => {
            authManager.destroy();
        };
    }, [clearAuthState, navigate]);

    return {
        login: (adminData: any) => {
            authManagerRef.current?.login(adminData);
        },
        logout: () => {
            authManagerRef.current?.logout();
        },
        getSessionInfo: () => {
            return authManagerRef.current?.getSessionInfo();
        },
    };
}
