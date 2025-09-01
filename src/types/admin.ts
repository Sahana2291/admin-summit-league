// src/types/admin.ts
import { Id } from "../../convex/_generated/dataModel";

export interface Admin {
    id: Id<"admins">;
    email: string;
    name: string;
    role: 'super_admin' | 'admin';
}

export interface User {
    _id: Id<"users">;
    firstName: string;
    lastName: string;
    email: string;
    imageUrl?: string;
    clerkId?: string;
    isActive: boolean;
    updatedAt: number;
    accountCount?: number;
    activeAccounts?: number;
}

export interface TradingAccount {
    _id: Id<"accounts">;
    user: Id<"users">;
    leagues?: Id<"leagues">;
    status: 'active' | 'inactive';
    broker?: any;
    name: string;
    deposit: number;
    leverage: number;
    group: string;
    login?: number;
    password: {
        investor: string;
        main: string;
    };
    payment?: Id<"payments">;
    updatedAt?: number;
    userName?: string;
    userEmail?: string;
    leagueName?: string;
}

export interface League {
    _id: Id<"leagues">;
    name: string;
    exp: number;
    status: 'active' | 'inactive';
    reward: number;
    description?: string;
    maxParticipants?: number;
    currentParticipants?: number;
    updatedAt?: number;
    participantCount?: number;
    activeParticipants?: number;
}

export interface Payment {
    _id: Id<"payments">;
    user: Id<"users">;
    league?: Id<"leagues">;
    status?: 'pending' | 'success' | 'failed';
    amount: number;
    updatedAt?: number;
    paymentIntent?: any;
    userName?: string;
    userEmail?: string;
    leagueName?: string;
}

export interface Activity {
    _id: Id<"activities">;
    type: 'registration' | 'league_join' | 'account_link' | 'prize_claim' | 'payment_processed' | 'account_created' | 'league_created' | 'user_suspended' | 'admin_action';
    userId?: Id<"users">;
    adminId?: Id<"admins">;
    userEmail?: string;
    entityId?: string;
    amount?: number;
    details?: string;
    timestamp: number;
}

export interface DashboardStats {
    totalUsers: number;
    totalUsersGrowth: number;
    activeUsers: number;
    leagueParticipants: number;
    participantsGrowth: number;
    totalTradingAccounts: number;
    accountsGrowth: number;
    activeAccounts: number;
    totalRevenue: number;
    revenueGrowth: number;
    activePrizePool: number;
    weeklyDistribution: number;
    avgAccountsPerUser: number;
    avgProfitLoss: number;
    totalLeagues: number;
    activeLeagues: number;
    totalPayments: number;
    pendingPayments: number;
}

export interface Agency {
    _id: Id<"agencies">;
    name: string;
    email: string;
    contactPerson: string;
    phone?: string;
    website?: string;
    commissionRate: number;
    status: 'active' | 'inactive';
    accessCode: string;
    directUrl?: string;
    totalReferrals?: number;
    totalCommission?: number;
    updatedAt?: number;
}

export interface Entry {
    _id: Id<"entries">;
    user: Id<"users">;
    league: Id<"leagues">;
    account: Id<"accounts">;
    payment?: Id<"payments">;
    status: 'pending' | 'active' | 'completed' | 'disqualified';
    entryDate: number;
    finalRank?: number;
    finalPnL?: number;
    prizeAwarded?: number;
    updatedAt?: number;
}

export interface LeaderboardEntry {
    _id: Id<"leaderboards">;
    league: Id<"leagues">;
    user: Id<"users">;
    account: Id<"accounts">;
    currentRank: number;
    previousRank?: number;
    pnl: number;
    pnlPercentage: number;
    trades: number;
    winRate?: number;
    lastUpdated: number;
}