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
  adminFeePercentage?: number;
  weekName?: string;
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

// Data generation utilities
const firstNames = [
  'James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Mary',
  'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen', 'Lisa',
  'Nancy', 'Betty', 'Dorothy', 'Sandra', 'Ashley', 'Kimberly', 'Emily', 'Donna', 'Margaret', 'Carol',
  'Michelle', 'Nicole', 'Samantha', 'Katherine', 'Christine', 'Deborah', 'Rachel', 'Carolyn', 'Janet', 'Ruth',
  'Maria', 'Heather', 'Diane', 'Julie', 'Joyce', 'Virginia', 'Victoria', 'Kelly', 'Christina', 'Joan',
  'Alexander', 'Christopher', 'Daniel', 'Matthew', 'Anthony', 'Mark', 'Donald', 'Steven', 'Paul', 'Andrew',
  'Joshua', 'Kenneth', 'Kevin', 'Brian', 'George', 'Timothy', 'Ronald', 'Jason', 'Edward', 'Jeffrey',
  'Ryan', 'Jacob', 'Gary', 'Nicholas', 'Eric', 'Jonathan', 'Stephen', 'Larry', 'Justin', 'Scott'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
  'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts',
  'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz', 'Parker', 'Cruz', 'Edwards', 'Collins', 'Reyes',
  'Stewart', 'Morris', 'Morales', 'Murphy', 'Cook', 'Rogers', 'Gutierrez', 'Ortiz', 'Morgan', 'Cooper',
  'Peterson', 'Bailey', 'Reed', 'Kelly', 'Howard', 'Ramos', 'Kim', 'Cox', 'Ward', 'Richardson'
];

const emailDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'trader.com', 'fx.com', 'market.com', 'invest.com'];

const traderNamePrefixes = ['Alpha', 'Pro', 'Master', 'Elite', 'Prime', 'Ultimate', 'Expert', 'Ace', 'Champion', 'Victory'];
const traderNameSuffixes = ['Trader', 'FX', 'Wolf', 'Bull', 'Bear', 'Eagle', 'Lion', 'Shark', 'Hawk', 'Tiger'];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function generateRandomDate(start: Date, end: Date): string {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString().split('T')[0];
}

function generateAffiliateCode(name: string): string {
  const cleanName = name.replace(/\s+/g, '').toUpperCase();
  const randomNum = Math.floor(Math.random() * 100);
  return cleanName.substring(0, 6) + randomNum;
}

// Generate large datasets
function generateUsers(count: number): User[] {
  const users: User[] = [];
  const statusOptions: User['status'][] = ['Active', 'Suspended', 'Banned'];
  const statusWeights = [0.85, 0.10, 0.05]; // 85% active, 10% suspended, 5% banned
  
  // Create some affiliate users first
  const affiliateCount = Math.floor(count * 0.15); // 15% are affiliates
  
  for (let i = 1; i <= count; i++) {
    const firstName = getRandomElement(firstNames);
    const lastName = getRandomElement(lastNames);
    const fullName = `${firstName} ${lastName}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${getRandomElement(emailDomains)}`;
    
    // Weighted random status selection
    const rand = Math.random();
    let status: User['status'] = 'Active';
    let cumWeight = 0;
    for (let j = 0; j < statusWeights.length; j++) {
      cumWeight += statusWeights[j];
      if (rand <= cumWeight) {
        status = statusOptions[j];
        break;
      }
    }
    
    const user: User = {
      id: i.toString(),
      email,
      fullName,
      age: Math.floor(Math.random() * 40) + 18, // 18-58 years old
      registrationDate: generateRandomDate(new Date('2024-01-01'), new Date('2024-12-20')),
      status
    };
    
    // Add affiliate code to some users (affiliates)
    if (i <= affiliateCount) {
      user.affiliateCode = generateAffiliateCode(fullName);
    }
    
    // Add referral for some non-affiliate users
    if (i > affiliateCount && Math.random() < 0.25 && users.length > 0) {
      const affiliateUsers = users.filter(u => u.affiliateCode);
      if (affiliateUsers.length > 0) {
        user.referredBy = getRandomElement(affiliateUsers).affiliateCode;
      }
    }
    
    users.push(user);
  }
  
  return users;
}

function generateTraderAccounts(users: User[], avgAccountsPerUser: number = 1.8): TraderAccount[] {
  const accounts: TraderAccount[] = [];
  let accountId = 1;
  
  users.forEach(user => {
    // Random number of accounts per user (0-5, weighted towards 1-2)
    const accountCount = Math.random() < 0.3 ? 0 : 
                        Math.random() < 0.4 ? 1 : 
                        Math.random() < 0.7 ? 2 : 
                        Math.random() < 0.9 ? 3 : 
                        Math.random() < 0.95 ? 4 : 5;
    
    for (let i = 0; i < accountCount; i++) {
      const prefix = getRandomElement(traderNamePrefixes);
      const suffix = getRandomElement(traderNameSuffixes);
      const number = Math.floor(Math.random() * 999);
      
      accounts.push({
        id: `acc${accountId}`,
        userId: user.id,
        traderName: accountCount === 1 ? `${prefix}${suffix}` : `${prefix}${suffix}_${i + 1}`,
        mt5AccountNumber: `MT5${(50000 + accountId).toString()}`,
        accountStatus: Math.random() < 0.8 ? 'Active' : Math.random() < 0.6 ? 'Inactive' : 'Suspended',
        createdDate: generateRandomDate(new Date(user.registrationDate), new Date('2024-12-20')),
        weekJoined: Math.floor(Math.random() * 10) + 30 // weeks 30-39
      });
      
      accountId++;
    }
  });
  
  return accounts;
}

// Generate mock data with thousands of users
export const mockUsers: User[] = generateUsers(5000); // 5000 users for demonstration

export const mockTraderAccounts: TraderAccount[] = generateTraderAccounts(mockUsers);

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