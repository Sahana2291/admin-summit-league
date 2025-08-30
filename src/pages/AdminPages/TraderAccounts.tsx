import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import {
  Search,
  Download,
  Plus,
  Eye,
  Ban,
  AlertTriangle,
  Activity,
  Users,
  TrendingUp,
  DollarSign,
  CheckCircle,
  RefreshCw,
  Edit,
  Shield,
  Wallet,
  Trophy
} from "lucide-react";
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useAuthStore } from '@/app/store/authStore';
import { useToast } from "@/hooks/use-toast";
import { Id } from "../../../convex/_generated/dataModel";

interface ProcessedAccount {
  _id: string;
  name: string; // trader name
  user: string; // user ID
  userName: string;
  userEmail: string;
  status: 'active' | 'inactive';
  deposit: number;
  leverage: number;
  group: string;
  login?: number; // MT5 account number
  createdAt: number;
  leagues?: string;
  leagueName?: string;
  payment?: string;
  broker?: any;
}

export const TraderAccounts = () => {
  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [leagueFilter, setLeagueFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Dialog states
  const [viewingAccount, setViewingAccount] = useState<ProcessedAccount | null>(null);
  const [suspendingAccount, setSuspendingAccount] = useState<ProcessedAccount | null>(null);

  // Loading states
  const [isSuspending, setIsSuspending] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const { admin } = useAuthStore();
  const { toast } = useToast();

  // Queries
  const rawAccounts = useQuery(api.admin.getAllAccounts) || [];
  const leagues = useQuery(api.admin.getAllLeagues) || [];
  const users = useQuery(api.admin.getAllUsers) || [];
  const payments = useQuery(api.admin.getAllPayments) || [];

  // Mutations
  const logActivity = useMutation(api.admin.logActivity);

  // Process accounts data
  const processedAccounts: ProcessedAccount[] = useMemo(() => {
    return rawAccounts.map(account => ({
      ...account,
      // Map the backend fields to UI expectations
    }));
  }, [rawAccounts]);

  // Filtering and sorting
  const filteredAndSortedAccounts = useMemo(() => {
    let filtered = processedAccounts.filter(account => {
      const matchesSearch =
        account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (account.login && account.login.toString().includes(searchTerm));

      const matchesStatus = statusFilter === "all" || account.status === statusFilter;
      const matchesLeague = leagueFilter === "all" || account.leagues === leagueFilter;

      return matchesSearch && matchesStatus && matchesLeague;
    });

    // Sort accounts
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof ProcessedAccount];
      let bValue: any = b[sortBy as keyof ProcessedAccount];

      if (sortBy === 'createdAt') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [processedAccounts, searchTerm, statusFilter, leagueFilter, sortBy, sortOrder]);

  // Statistics
  const stats = useMemo(() => {
    const totalAccounts = processedAccounts.length;
    const activeAccounts = processedAccounts.filter(a => a.status === 'active').length;

    // Multi-account users detection
    const userAccountCounts = new Map();
    processedAccounts.forEach(acc => {
      const count = userAccountCounts.get(acc.user) || 0;
      userAccountCounts.set(acc.user, count + 1);
    });
    const multipleAccountUsers = Array.from(userAccountCounts.entries()).filter(([_, count]) => count > 1).length;

    const avgAccountsPerUser = users.length > 0 ? (totalAccounts / users.length) : 0;
    const totalDeposits = processedAccounts.reduce((sum, acc) => sum + acc.deposit, 0);

    return {
      totalAccounts,
      activeAccounts,
      multipleAccountUsers,
      avgAccountsPerUser,
      totalDeposits
    };
  }, [processedAccounts, users]);

  const handleSuspendAccount = async () => {
    if (!admin || !suspendingAccount) return;
    setIsSuspending(true);

    try {
      // In a real implementation, you'd have an updateAccountStatus mutation
      await logActivity({
        type: "admin_action",
        adminId: admin.id as Id<"admins">,
        entityId: suspendingAccount._id,
        details: `${suspendingAccount.status === 'active' ? 'Suspended' : 'Activated'} trading account: ${suspendingAccount.name}`,
      });

      toast({
        title: "Account Updated",
        description: `Trading account has been ${suspendingAccount.status === 'active' ? 'suspended' : 'activated'} successfully.`,
      });

      setSuspendingAccount(null);

    } catch (error) {
      console.error('Error updating account status:', error);
      toast({
        title: "Error",
        description: "Failed to update account status.",
        variant: "destructive",
      });
    } finally {
      setIsSuspending(false);
    }
  };

  const handleExportAccounts = async () => {
    setIsExporting(true);

    try {
      const csvData = filteredAndSortedAccounts.map(account => ({
        'Account ID': account._id,
        'Trader Name': account.name,
        'User Name': account.userName,
        'User Email': account.userEmail,
        'MT5 Login': account.login || 'N/A',
        'Status': account.status,
        'Deposit': `$${account.deposit}`,
        'Leverage': `${account.leverage}:1`,
        'Group': account.group,
        'League': account.leagueName || 'N/A',
        'Created Date': new Date(account.createdAt).toLocaleDateString(),
        'Payment ID': account.payment || 'N/A'
      }));

      // Convert to CSV
      const headers = Object.keys(csvData[0] || {});
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => headers.map(header => `"${row[header as keyof typeof row]}"`).join(','))
      ].join('\n');

      // Download
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `trader_accounts_export_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export Complete",
        description: `Exported ${filteredAndSortedAccounts.length} accounts to CSV.`,
      });

    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export account data.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'inactive': return 'secondary';
      default: return 'default';
    }
  };

  const getUserAccountCount = (userId: string) => {
    return processedAccounts.filter(acc => acc.user === userId).length;
  };

  const getMultipleAccountUsers = () => {
    const userAccountCounts = new Map();
    processedAccounts.forEach(acc => {
      const count = userAccountCounts.get(acc.user) || 0;
      userAccountCounts.set(acc.user, count + 1);
    });
    return Array.from(userAccountCounts.entries()).filter(([_, count]) => count > 1);
  };

  const multipleAccountUsers = getMultipleAccountUsers();

  if (rawAccounts === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading trading accounts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Trading Accounts</h1>
          <p className="text-muted-foreground">Manage MT5 trading accounts and user profiles</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-primary text-primary-foreground shadow-glow">
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 opacity-80" />
              <div>
                <div className="text-2xl font-bold">{stats.totalAccounts}</div>
                <p className="text-sm opacity-80">Total Accounts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{stats.activeAccounts}</div>
                <p className="text-sm text-muted-foreground">Active Accounts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold">{stats.multipleAccountUsers}</div>
                <p className="text-sm text-muted-foreground">Multi-Account Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{stats.avgAccountsPerUser.toFixed(1)}</div>
                <p className="text-sm text-muted-foreground">Avg Accounts/User</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">${stats.totalDeposits.toLocaleString()}</div>
                <p className="text-sm text-muted-foreground">Total Deposits</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Multiple Account Alert */}
      {multipleAccountUsers.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800 dark:text-yellow-200">Multiple Account Detection</p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  {multipleAccountUsers.length} users have multiple trading accounts. Review for compliance.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Account Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by trader name, MT5 login, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select value={leagueFilter} onValueChange={setLeagueFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by league" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Leagues</SelectItem>
                  {leagues.map((league) => (
                    <SelectItem key={league._id} value={league._id}>
                      {league.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Created Date</SelectItem>
                  <SelectItem value="name">Trader Name</SelectItem>
                  <SelectItem value="deposit">Deposit</SelectItem>
                  <SelectItem value="leverage">Leverage</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </Button>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex gap-4">
                <Button
                  onClick={handleExportAccounts}
                  variant="outline"
                  disabled={isExporting || filteredAndSortedAccounts.length === 0}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isExporting ? "Exporting..." : "Export CSV"}
                </Button>
              </div>

              <div className="text-sm text-muted-foreground">
                Showing {filteredAndSortedAccounts.length} of {processedAccounts.length} accounts
              </div>
            </div>
          </div>

          {/* Accounts Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Trader</TableHead>
                <TableHead>User Details</TableHead>
                <TableHead>Account Info</TableHead>
                <TableHead>Trading Setup</TableHead>
                <TableHead>Competition</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedAccounts.map((account) => {
                const userAccountCount = getUserAccountCount(account.user);
                return (
                  <TableRow key={account._id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="font-medium">{account.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {account.login && `MT5: ${account.login}`}
                          </div>
                        </div>
                        {userAccountCount > 1 && (
                          <Badge variant="outline" className="text-xs">
                            +{userAccountCount - 1} more
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">{account.userEmail}</div>
                        <div className="text-xs text-muted-foreground">{account.userName}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="flex items-center gap-1">
                          <Wallet className="w-3 h-3" />
                          ${account.deposit.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Group: {account.group}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          {account.leverage}:1 leverage
                        </div>
                        {account.broker && (
                          <div className="text-xs text-muted-foreground">
                            Broker connected
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {account.leagueName ? (
                        <Badge variant="outline" className="text-xs">
                          {account.leagueName}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(account.status)}>
                        {account.status === 'active' ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(account.createdAt).toLocaleDateString()}
                        <div className="text-xs text-muted-foreground">
                          {new Date(account.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setViewingAccount(account)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSuspendingAccount(account)}
                        >
                          {account.status === 'active' ? (
                            <Ban className="w-4 h-4" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {filteredAndSortedAccounts.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No accounts found</p>
              <p className="text-sm">Try adjusting your search or filters.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Account Modal */}
      <Dialog open={!!viewingAccount} onOpenChange={() => setViewingAccount(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Account Details - {viewingAccount?.name}
            </DialogTitle>
          </DialogHeader>
          {viewingAccount && (
            <div className="space-y-6">
              {/* Account Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Account Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Trader Name</label>
                      <p className="font-medium">{viewingAccount.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">MT5 Login</label>
                      <p className="text-sm font-mono">{viewingAccount.login || 'Not assigned'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Status</label>
                      <div className="mt-1">
                        <Badge variant={getStatusBadgeVariant(viewingAccount.status)}>
                          {viewingAccount.status === 'active' ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Account ID</label>
                      <p className="text-xs font-mono bg-muted px-2 py-1 rounded">{viewingAccount._id}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      User Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">User Name</label>
                      <p className="font-medium">{viewingAccount.userName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <p className="text-sm">{viewingAccount.userEmail}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Account Count</label>
                      <p className="text-sm">{getUserAccountCount(viewingAccount.user)} trading accounts</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Created</label>
                      <p className="text-sm">{new Date(viewingAccount.createdAt).toLocaleDateString()}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Trading Configuration */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Trading Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">${viewingAccount.deposit.toLocaleString()}</div>
                      <p className="text-sm text-muted-foreground">Initial Deposit</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{viewingAccount.leverage}:1</div>
                      <p className="text-sm text-muted-foreground">Leverage</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-lg font-bold text-purple-600">{viewingAccount.group}</div>
                      <p className="text-sm text-muted-foreground">Trading Group</p>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-lg font-bold text-orange-600">
                        {viewingAccount.broker ? 'Connected' : 'Pending'}
                      </div>
                      <p className="text-sm text-muted-foreground">Broker Status</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Competition Information */}
              {viewingAccount.leagueName && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Trophy className="w-4 h-4" />
                      Competition Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Current League</label>
                      <p className="font-medium">{viewingAccount.leagueName}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Credentials (for admin only) */}
              <Card className="border-red-200 bg-red-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2 text-red-800">
                    <Shield className="w-4 h-4" />
                    Account Credentials (Admin Only)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p className="text-red-700 text-xs mb-3">
                    ⚠️ Sensitive information - Handle with care
                  </p>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Payment Reference</label>
                    <p className="font-mono text-xs bg-muted px-2 py-1 rounded">
                      {viewingAccount.payment || 'No payment linked'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Suspend/Activate Account Confirmation Dialog */}
      <AlertDialog open={!!suspendingAccount} onOpenChange={() => setSuspendingAccount(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {suspendingAccount?.status === 'active' ? (
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              ) : (
                <CheckCircle className="w-5 h-5 text-green-600" />
              )}
              {suspendingAccount?.status === 'active' ? 'Suspend' : 'Activate'} Trading Account
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {suspendingAccount?.status === 'active' ? 'suspend' : 'activate'} the trading account
              "<strong>{suspendingAccount?.name}</strong>"?

              {suspendingAccount?.status === 'active' && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-800">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="font-medium">Warning</span>
                  </div>
                  <p className="text-sm text-yellow-700 mt-1">
                    Suspending this account will prevent the user from participating in competitions.
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSuspending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSuspendAccount}
              disabled={isSuspending}
              className={suspendingAccount?.status === 'active' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
            >
              {isSuspending ? "Processing..." :
                (suspendingAccount?.status === 'active' ? 'Suspend Account' : 'Activate Account')
              }
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};