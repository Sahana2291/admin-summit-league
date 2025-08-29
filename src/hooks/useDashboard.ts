// src/hooks/useDashboard.ts
import { useQuery } from '@tanstack/react-query';
import { useConvex } from 'convex/react';
import { anyApi as api } from 'convex/server';

export function useDashboard() {
    const convex = useConvex();

    const dashboardQuery = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: () => convex.query(api.admin.getDashboardStats),
        refetchInterval: 60000, // Refresh every minute
    });

    const activitiesQuery = useQuery({
        queryKey: ['recent-activities'],
        queryFn: () => convex.query(api.admin.getRecentActivities, { limit: 10 }),
        refetchInterval: 30000, // Refresh every 30 seconds
    });

    return {
        stats: dashboardQuery.data,
        activities: activitiesQuery.data,
        isLoading: dashboardQuery.isLoading || activitiesQuery.isLoading,
        error: dashboardQuery.error || activitiesQuery.error,
    };
}