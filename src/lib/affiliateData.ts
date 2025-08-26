// Mock data for affiliate management system

export interface Agency {
  id: string;
  name: string;
  legalEntity: string;
  primaryContact: {
    name: string;
    email: string;
  };
  country: string;
  payoutMethod: 'bank' | 'crypto';
  defaultCommissionModel: 'CPA' | 'RevShare' | 'Hybrid';
  defaultRate: number;
  kycStatus: 'Pending' | 'Approved' | 'Rejected';
  status: 'Draft' | 'Pending KYC' | 'Active' | 'Suspended';
  notes: string;
  createdAt: Date;
  lastActivity: Date;
  activeInfluencers: number;
  last7dClicks: number;
  last7dQualified: number;
  estPayout: number;
  directUrl?: string;
  directUrlExpiry?: Date;
}

export interface Influencer {
  id: string;
  agencyId: string;
  name: string;
  handle: string;
  region: string;
  contactEmail: string;
  profileNote: string;
  commissionModel: 'CPA' | 'RevShare' | 'Hybrid';
  commissionRate: number;
  status: 'Active' | 'Paused' | 'Blocked';
  referralCode: string;
  clicks: number;
  signups: number;
  funded: number;
  qualified: number;
  conversionRate: number;
  estPayout: number;
  createdAt: Date;
}

export interface Referral {
  id: string;
  agencyId: string;
  influencerId: string;
  userEmail: string;
  codeUsed: string;
  campaign: string;
  status: 'Clicked' | 'Registered' | 'Funded' | 'Qualified';
  fundingAmount?: number;
  qualificationFlag: boolean;
  country: string;
  notes: string;
  createdAt: Date;
}

export interface AccessLog {
  id: string;
  agencyId: string;
  timestamp: Date;
  email?: string;
  ip: string;
  country: string;
  device: string;
  result: 'Opened' | 'Abandoned' | 'Registered';
}

export interface CodeIssueLog {
  id: string;
  agencyId: string;
  timestamp: Date;
  email: string;
  issuedCode: string;
  status: 'Issued' | 'Claimed' | 'Revoked';
  notes: string;
}

export interface Payout {
  id: string;
  agencyId: string;
  period: string;
  grossCommissions: number;
  adjustments: number;
  netPayable: number;
  status: 'Pending' | 'Processing' | 'Paid' | 'On Hold';
  createdAt: Date;
}

// Mock data
export const mockAgencies: Agency[] = [
  {
    id: 'ag-001',
    name: 'Alpha Trading Partners',
    legalEntity: 'Alpha Trading Partners LLC',
    primaryContact: {
      name: 'John Smith',
      email: 'john@alphatrading.com'
    },
    country: 'United States',
    payoutMethod: 'bank',
    defaultCommissionModel: 'RevShare',
    defaultRate: 15,
    kycStatus: 'Approved',
    status: 'Active',
    notes: 'Tier 1 agency with excellent performance',
    createdAt: new Date('2024-01-15'),
    lastActivity: new Date('2024-08-25'),
    activeInfluencers: 12,
    last7dClicks: 2840,
    last7dQualified: 156,
    estPayout: 8500,
    directUrl: 'https://app.com/invite/alpha-2024',
    directUrlExpiry: new Date('2024-09-15')
  },
  {
    id: 'ag-002',
    name: 'Beta Forex Network',
    legalEntity: 'Beta Forex Network Ltd',
    primaryContact: {
      name: 'Sarah Johnson',
      email: 'sarah@betaforex.com'
    },
    country: 'United Kingdom',
    payoutMethod: 'crypto',
    defaultCommissionModel: 'CPA',
    defaultRate: 250,
    kycStatus: 'Approved',
    status: 'Active',
    notes: 'Specializes in European markets',
    createdAt: new Date('2024-02-20'),
    lastActivity: new Date('2024-08-24'),
    activeInfluencers: 8,
    last7dClicks: 1920,
    last7dQualified: 89,
    estPayout: 22250,
    directUrl: 'https://app.com/invite/beta-2024',
    directUrlExpiry: new Date('2024-09-10')
  },
  {
    id: 'ag-003',
    name: 'Gamma Capital Affiliates',
    legalEntity: 'Gamma Capital Affiliates Inc',
    primaryContact: {
      name: 'Michael Chen',
      email: 'michael@gammacapital.com'
    },
    country: 'Canada',
    payoutMethod: 'bank',
    defaultCommissionModel: 'Hybrid',
    defaultRate: 12.5,
    kycStatus: 'Pending',
    status: 'Pending KYC',
    notes: 'New agency pending verification',
    createdAt: new Date('2024-08-01'),
    lastActivity: new Date('2024-08-20'),
    activeInfluencers: 0,
    last7dClicks: 0,
    last7dQualified: 0,
    estPayout: 0
  }
];

export const mockInfluencers: Influencer[] = [
  {
    id: 'inf-001',
    agencyId: 'ag-001',
    name: 'Alex Trader',
    handle: '@alextrader',
    region: 'North America',
    contactEmail: 'alex@alextrader.com',
    profileNote: 'YouTube creator with 500K subscribers',
    commissionModel: 'RevShare',
    commissionRate: 15,
    status: 'Active',
    referralCode: 'ALPHA-ALEX',
    clicks: 1200,
    signups: 85,
    funded: 62,
    qualified: 58,
    conversionRate: 4.83,
    estPayout: 3200,
    createdAt: new Date('2024-03-01')
  },
  {
    id: 'inf-002',
    agencyId: 'ag-001',
    name: 'Emma Finance',
    handle: '@emmafinance',
    region: 'Europe',
    contactEmail: 'emma@emmafinance.com',
    profileNote: 'TikTok influencer focused on forex education',
    commissionModel: 'RevShare',
    commissionRate: 15,
    status: 'Active',
    referralCode: 'ALPHA-EMMA',
    clicks: 980,
    signups: 72,
    funded: 48,
    qualified: 45,
    conversionRate: 4.59,
    estPayout: 2800,
    createdAt: new Date('2024-04-15')
  }
];

export const mockReferrals: Referral[] = [
  {
    id: 'ref-001',
    agencyId: 'ag-001',
    influencerId: 'inf-001',
    userEmail: 'user1@example.com',
    codeUsed: 'ALPHA-ALEX',
    campaign: 'Q3 2024 Campaign',
    status: 'Qualified',
    fundingAmount: 1000,
    qualificationFlag: true,
    country: 'United States',
    notes: 'High-value trader',
    createdAt: new Date('2024-08-20')
  },
  {
    id: 'ref-002',
    agencyId: 'ag-001',
    influencerId: 'inf-002',
    userEmail: 'user2@example.com',
    codeUsed: 'ALPHA-EMMA',
    campaign: 'Q3 2024 Campaign',
    status: 'Funded',
    fundingAmount: 500,
    qualificationFlag: false,
    country: 'United Kingdom',
    notes: 'Pending qualification requirements',
    createdAt: new Date('2024-08-21')
  }
];

export const mockAccessLogs: AccessLog[] = [
  {
    id: 'log-001',
    agencyId: 'ag-001',
    timestamp: new Date('2024-08-25T10:30:00'),
    email: 'prospect@company.com',
    ip: '192.168.1.1',
    country: 'United States',
    device: 'Desktop Chrome',
    result: 'Registered'
  }
];

export const mockCodeIssueLogs: CodeIssueLog[] = [
  {
    id: 'issue-001',
    agencyId: 'ag-001',
    timestamp: new Date('2024-08-25T10:35:00'),
    email: 'prospect@company.com',
    issuedCode: 'ALPHA123',
    status: 'Claimed',
    notes: 'Successfully onboarded'
  }
];

export const mockPayouts: Payout[] = [
  {
    id: 'payout-001',
    agencyId: 'ag-001',
    period: 'July 2024',
    grossCommissions: 12500,
    adjustments: -250,
    netPayable: 12250,
    status: 'Paid',
    createdAt: new Date('2024-08-01')
  },
  {
    id: 'payout-002',
    agencyId: 'ag-001',
    period: 'August 2024',
    grossCommissions: 8500,
    adjustments: 0,
    netPayable: 8500,
    status: 'Pending',
    createdAt: new Date('2024-08-25')
  }
];