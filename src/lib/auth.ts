// src/lib/auth.ts
import { redirect } from 'react-router';
import { useAuthStore } from '@/app/store';

export function protectedLoader() {
    const isAuthenticated = useAuthStore.getState().isAuthenticated;
    if (!isAuthenticated) {
        throw redirect('/admin/login');
    }
    return null;
}