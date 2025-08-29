// src/app/store/adminStore.ts
import { create } from 'zustand';
import { DashboardStats, User, TradingAccount, League, Payment, Activity } from '@/types/admin';

export interface AdminState {
    // Dashboard data
    dashboardStats: DashboardStats | null;

    // Entity data
    users: User[];
    accounts: TradingAccount[];
    leagues: League[];
    payments: Payment[];
    activities: Activity[];

    // Loading states
    isLoading: boolean;
    isLoadingUsers: boolean;
    isLoadingAccounts: boolean;
    isLoadingLeagues: boolean;
    isLoadingPayments: boolean;

    // Actions
    setDashboardStats: (stats: DashboardStats) => void;
    setUsers: (users: User[]) => void;
    setAccounts: (accounts: TradingAccount[]) => void;
    setLeagues: (leagues: League[]) => void;
    setPayments: (payments: Payment[]) => void;
    setActivities: (activities: Activity[]) => void;
    setLoading: (loading: boolean) => void;
    setLoadingUsers: (loading: boolean) => void;
    setLoadingAccounts: (loading: boolean) => void;
    setLoadingLeagues: (loading: boolean) => void;
    setLoadingPayments: (loading: boolean) => void;

    // Update individual entities
    updateUser: (userId: string, updates: Partial<User>) => void;
    updateAccount: (accountId: string, updates: Partial<TradingAccount>) => void;
    updateLeague: (leagueId: string, updates: Partial<League>) => void;
    updatePayment: (paymentId: string, updates: Partial<Payment>) => void;
}

export const useAdminStore = create<AdminState>((set, get) => ({
    // Initial state
    dashboardStats: null,
    users: [],
    accounts: [],
    leagues: [],
    payments: [],
    activities: [],
    isLoading: false,
    isLoadingUsers: false,
    isLoadingAccounts: false,
    isLoadingLeagues: false,
    isLoadingPayments: false,

    // Actions
    setDashboardStats: (stats) => set({ dashboardStats: stats }),
    setUsers: (users) => set({ users }),
    setAccounts: (accounts) => set({ accounts }),
    setLeagues: (leagues) => set({ leagues }),
    setPayments: (payments) => set({ payments }),
    setActivities: (activities) => set({ activities }),
    setLoading: (loading) => set({ isLoading: loading }),
    setLoadingUsers: (loading) => set({ isLoadingUsers: loading }),
    setLoadingAccounts: (loading) => set({ isLoadingAccounts: loading }),
    setLoadingLeagues: (loading) => set({ isLoadingLeagues: loading }),
    setLoadingPayments: (loading) => set({ isLoadingPayments: loading }),

    // Update methods
    updateUser: (userId, updates) => set((state) => ({
        users: state.users.map(user =>
            user._id === userId ? { ...user, ...updates } : user
        )
    })),

    updateAccount: (accountId, updates) => set((state) => ({
        accounts: state.accounts.map(account =>
            account._id === accountId ? { ...account, ...updates } : account
        )
    })),

    updateLeague: (leagueId, updates) => set((state) => ({
        leagues: state.leagues.map(league =>
            league._id === leagueId ? { ...league, ...updates } : league
        )
    })),

    updatePayment: (paymentId, updates) => set((state) => ({
        payments: state.payments.map(payment =>
            payment._id === paymentId ? { ...payment, ...updates } : payment
        )
    })),
}));