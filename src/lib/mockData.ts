// Mock data for the Leadership League Admin Panel
export interface User {
  id: string;
  email: string;
  fullName: string;
  age: number;
  registrationDate: string;
  status: 'Active' | 'Suspended' | 'Banned';
  affiliateCode?: string;
  referredBy?: string;
}

export interface TraderAccount {
  id: string;
  userId: string;
  traderName: string;
  mt5AccountNumber: string;
  accountStatus: 'Active' | 'Inactive' | 'Suspended';
  createdDate: string;
  weekJoined: number;
}

export interface Competition {
  id: string;
  weekNumber: number;
  startDate: string;
  endDate: string;
  totalParticipants: number;
  totalPrizePool: number;
  adminFeeAmount: number;
  status: 'Active' | 'Completed' | 'Scheduled';
  entryFee: number;
}

export interface CompetitionEntry {
  id: string;
  competitionId: string;
  accountId: string;
  entryFeePaid: number;
  entryDate: string;
  profitPercent?: number;
  drawdown?: number;
  finalRank?: number;
  prizeWon?: number;
}

export interface Transaction {
  id: string;
  userId: string;
  accountId?: string;
  type: 'Entry Fee' | 'Prize Payout' | 'Affiliate Commission';
  amount: number;
  weekId: string;
  paymentMethod: string;
  transactionDate: string;
  status: 'Pending' | 'Completed' | 'Failed';
}

export interface AffiliateCommission {
  id: string;
  affiliateUserId: string;
  referredUserId: string;
  entryFeeAmount: number;
  commissionRate: number;
  commissionAmount: number;
  weekId: string;
  status: 'Pending' | 'Paid';
}

export interface ClaimRequest {
  id: string;
  userId: string;
  accountId: string;
  amount: number;
  method: 'Withdraw' | 'PFH Credit' | 'TradeMind AI';
  status: 'Pending' | 'Approved' | 'Rejected';
  requestDate: string;
}

// Mock Data
export const mockUsers: User[] = [
  {
    id: '1',
    email: 'alpha@trader.com',
    fullName: 'Alex Wolf',
    age: 28,
    registrationDate: '2024-09-01',
    status: 'Active',
    affiliateCode: 'ALPHA10'
  },
  {
    id: '2',
    email: 'pro@trader.com',
    fullName: 'Sarah Pro',
    age: 32,
    registrationDate: '2024-10-11',
    status: 'Active',
    affiliateCode: 'PRO5'
  },
  {
    id: '3',
    email: 'mark@trader.com',
    fullName: 'Mark Masters',
    age: 25,
    registrationDate: '2024-11-22',
    status: 'Active',
    referredBy: 'ALPHA10'
  },
  {
    id: '4',
    email: 'new1@trader.com',
    fullName: 'John New',
    age: 30,
    registrationDate: '2024-12-01',
    status: 'Active',
    referredBy: 'PRO5'
  }
];

export const mockTraderAccounts: TraderAccount[] = [
  {
    id: 'acc1',
    userId: '1',
    traderName: 'AlphaWolf',
    mt5AccountNumber: 'MT5001',
    accountStatus: 'Active',
    createdDate: '2024-09-01',
    weekJoined: 33
  },
  {
    id: 'acc2',
    userId: '1',
    traderName: 'Wolf_2',
    mt5AccountNumber: 'MT5002',
    accountStatus: 'Inactive',
    createdDate: '2024-09-15',
    weekJoined: 33
  },
  {
    id: 'acc3',
    userId: '2',
    traderName: 'TraderPro_88',
    mt5AccountNumber: 'MT5003',
    accountStatus: 'Active',
    createdDate: '2024-10-11',
    weekJoined: 34
  },
  {
    id: 'acc4',
    userId: '3',
    traderName: 'MarketMaster',
    mt5AccountNumber: 'MT5004',
    accountStatus: 'Active',
    createdDate: '2024-11-22',
    weekJoined: 34
  }
];

export const mockCompetitions: Competition[] = [
  {
    id: 'comp35',
    weekNumber: 35,
    startDate: '2024-12-16',
    endDate: '2024-12-22',
    totalParticipants: 1247,
    totalPrizePool: 31175,
    adminFeeAmount: 31175,
    status: 'Active',
    entryFee: 50
  },
  {
    id: 'comp34',
    weekNumber: 34,
    startDate: '2024-12-09',
    endDate: '2024-12-15',
    totalParticipants: 1012,
    totalPrizePool: 25300,
    adminFeeAmount: 25300,
    status: 'Completed',
    entryFee: 50
  },
  {
    id: 'comp33',
    weekNumber: 33,
    startDate: '2024-12-02',
    endDate: '2024-12-08',
    totalParticipants: 980,
    totalPrizePool: 24500,
    adminFeeAmount: 24500,
    status: 'Completed',
    entryFee: 50
  }
];

export const mockTransactions: Transaction[] = [
  {
    id: 'tx1',
    userId: '1',
    accountId: 'acc1',
    type: 'Entry Fee',
    amount: 50,
    weekId: 'comp35',
    paymentMethod: 'Credit Card',
    transactionDate: '2024-12-16',
    status: 'Completed'
  },
  {
    id: 'tx2',
    userId: '2',
    accountId: 'acc3',
    type: 'Prize Payout',
    amount: 320,
    weekId: 'comp34',
    paymentMethod: 'Withdraw',
    transactionDate: '2024-12-15',
    status: 'Pending'
  }
];

export const mockAffiliateCommissions: AffiliateCommission[] = [
  {
    id: 'aff1',
    affiliateUserId: '1',
    referredUserId: '3',
    entryFeeAmount: 50,
    commissionRate: 0.1,
    commissionAmount: 5,
    weekId: 'comp35',
    status: 'Pending'
  },
  {
    id: 'aff2',
    affiliateUserId: '2',
    referredUserId: '4',
    entryFeeAmount: 50,
    commissionRate: 0.08,
    commissionAmount: 4,
    weekId: 'comp35',
    status: 'Pending'
  }
];

export const mockClaimRequests: ClaimRequest[] = [
  {
    id: 'claim1',
    userId: '1',
    accountId: 'acc1',
    amount: 320,
    method: 'Withdraw',
    status: 'Pending',
    requestDate: '2024-12-15'
  },
  {
    id: 'claim2',
    userId: '2',
    accountId: 'acc3',
    amount: 150,
    method: 'PFH Credit',
    status: 'Pending',
    requestDate: '2024-12-14'
  },
  {
    id: 'claim3',
    userId: '3',
    accountId: 'acc4',
    amount: 80,
    method: 'TradeMind AI',
    status: 'Pending',
    requestDate: '2024-12-13'
  }
];

export const adminConfig = {
  adminFeePct: 50,
  maintenance: false
};