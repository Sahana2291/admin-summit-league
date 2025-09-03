// src/hooks/useDashboard.ts
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api'

export function useDashboard() {
    const stats = useQuery(api.admin.getDashboardStats);
    // const activities = useQuery(api.admin.getRecentActivities, { limit: 10 });

    return {
        stats,
        activities: stats?.recentActivities || [],
        isLoading: stats === undefined,
        // isLoading: stats === undefined || activities === undefined,
    };
}