// src/app/providers/SessionProvider.tsx
import { useEffect } from 'react';
import { useAuthStore } from '@/app/store/authStore';
import { AuthManager } from '@/lib/authManager';

export function SessionProvider({ children }: { children: React.ReactNode }) {
    const { login: setAuth, logout: clearAuth } = useAuthStore();

    useEffect(() => {
        const authManager = AuthManager.getInstance();

        const handleLogout = () => {
            console.log('calling 2');
            clearAuth();
            // Navigation will be handled by route protection
        };

        // Initialize auth manager first
        authManager.initialize(handleLogout);

        // Then check for existing session
        const sessionInfo = authManager.getSessionInfo();
        if (sessionInfo && authManager.isSessionValid()) {
            setAuth(sessionInfo.admin);
        } else if (sessionInfo) {
            // Session expired, clean up
            authManager.logout();
        }

        return () => {
            authManager.destroy();
        };
    }, [setAuth, clearAuth]);

    return <>{children}</>;
}