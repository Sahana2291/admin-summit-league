import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Admin {
    id: string;
    email: string;
    name: string;
    role: 'super_admin' | 'admin';
}

interface AuthState {
    admin: Admin | null;
    isAuthenticated: boolean;
    login: (admin: Admin) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            admin: null,
            isAuthenticated: false,
            login: (admin) => set({ admin, isAuthenticated: true }),
            logout: () => set({ admin: null, isAuthenticated: false }),
        }),
        {
            name: 'admin-auth',
        }
    )
);