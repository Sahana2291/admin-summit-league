// src/lib/auth.ts
import { redirect } from 'react-router';
import { useAuthStore } from '@/app/store';
import { AuthManager } from './authManager';

export function protectedLoader() {
    const authManager = AuthManager.getInstance();
    const isValid = authManager.isSessionValid();

    if (!isValid) {
        // Clear any stale auth state
        useAuthStore.getState().logout();
        throw redirect('/admin/login');
    }
    return null;

    // const isAuthenticated = useAuthStore.getState().isAuthenticated;
    // if (!isAuthenticated) {
    //     throw redirect('/admin/login');
    // }
    // return null;
}