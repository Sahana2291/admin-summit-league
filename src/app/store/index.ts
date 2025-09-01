// src/app/store/index.ts

// Export all stores from a central location for easier imports
export { useAuthStore } from './authStore';
export { useAdminStore } from './adminStore';

// You can also export types if needed
export type { AuthState } from './authStore';
export type { AdminState } from './adminStore';

// Optional: Create a combined store selector hook for complex operations
import { useAuthStore } from './authStore';
import { useAdminStore } from './adminStore';

/**
 * Combined hook that provides access to both auth and admin stores
 * Useful when components need data from multiple stores
 */
export const useAppStores = () => ({
    auth: useAuthStore(),
    admin: useAdminStore(),
});

/**
 * Selector hook for getting only authentication status
 * More performant than subscribing to the entire auth store
 */
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);

/**
 * Selector hook for getting current admin user
 */
export const useCurrentAdmin = () => useAuthStore((state) => state.admin);

/**
 * Selector hook for dashboard loading state
 */
export const useDashboardLoading = () => useAdminStore((state) => state.isLoading);