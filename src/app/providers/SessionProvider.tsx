import { useEffect } from 'react';
import { useAuthStore } from '@/app/store/authStore';
import { AuthManager } from '@/lib/authManager';

export function SessionProvider({ children }: { children: React.ReactNode }) {
    const { login: setAuth, isAuthenticated } = useAuthStore();

    useEffect(() => {
        // Check if there's a valid session on app start
        const authManager = AuthManager.getInstance();
        const sessionInfo = authManager.getSessionInfo();

        if (sessionInfo && authManager.isSessionValid()) {
            setAuth(sessionInfo.admin);
        }
    }, [setAuth]);

    return <>{children}</>;
}