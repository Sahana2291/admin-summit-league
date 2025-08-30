// src/pages/AdminPages/UserManagement.tsx
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import {
  Search,
  Download,
  Eye,
  Ban,
  Mail,
  Calendar,
  Users,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  Activity,
  DollarSign,
  RefreshCw
} from "lucide-react";
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useAuthStore } from '@/app/store/authStore';
import { useToast } from "@/hooks/use-toast";
import { Id } from "../../../convex/_generated/dataModel";

interface ProcessedUser {
  _id: string;
  fullName: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  createdAt: number;
  referralCode?: string;
  country?: string;
  accountCount: number;
  activeAccounts: number;
  totalPayments: number;
  totalSpent: number;
  clerkId: string;
  imageUrl?: string;
}

export const UserManagement = () => {
  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  // Dialog states
  const [viewingUser, setViewingUser] = useState<ProcessedUser | null>(null);
  const [suspendingUser, setSuspendingUser] = useState<ProcessedUser | null>(null);
  const [editingUser, setEditingUser] = useState<ProcessedUser | null>(null);

  // Loading states
  const [isSuspending, setIsSuspending] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const { admin } = useAuthStore();
  const { toast } = useToast();

  // Queries
  const rawUsers = useQuery(api.admin.getAllUsers) || [];
  const payments = useQuery(api.admin.getAllPayments) || [];
  const accounts = useQuery(api.admin.getAllAccounts) || [];
  const dashboardStats = useQuery(api.admin.getDashboardStats);

  // Mutations
  const updateUserStatus = useMutation(api.admin.updateUserStatus);
  const logActivity = useMutation(api.admin.logActivity);

  // Process users data to match the expected interface
  const processedUsers: ProcessedUser[] = useMemo(() => {
    return rawUsers.map(user => ({
      ...user,
      fullName: `${user.firstName} ${user.lastName}`.trim(),
    }));
  }, [rawUsers]);

  // Memoized filtering and sorting for performance
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = processedUsers.filter(user => {
      const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase());

      let matchesStatus = false;
      if (statusFilter === "all") matchesStatus = true;
      else if (statusFilter === "active") matchesStatus = user.isActive;
      else if (statusFilter === "inactive") matchesStatus = !user.isActive;

      return matchesSearch && matchesStatus;
    });

    // Sort users
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof ProcessedUser];
      let bValue: any = b[sortBy as keyof ProcessedUser];

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
  }, [processedUsers, searchTerm, statusFilter, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedUsers.length / pageSize);
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredAndSortedUsers.slice(startIndex, startIndex + pageSize);
  }, [filteredAndSortedUsers, currentPage, pageSize]);

  // Statistics
  const stats = useMemo(() => {
    const totalUsers = processedUsers.length;
    const activeUsers = processedUsers.filter(u => u.isActive).length;
    const affiliates = processedUsers.filter(u => u.referralCode).length;
    const referredUsers = 0; // Would need referral tracking in schema
    const totalRevenue = payments
      .filter(p => p.status === 'success')
      .reduce((sum, p) => sum + p.amount, 0);

    return {
      totalUsers,
      activeUsers,
      affiliates,
      referredUsers,
      totalRevenue
    };
  }, [processedUsers, payments]);

  const handleSuspendUser = async (reason?: string) => {
    if (!admin || !suspendingUser) return;
    setIsSuspending(true);

    try {
      const newStatus = !suspendingUser.isActive;

      await updateUserStatus({
        userId: suspendingUser._id as Id<"users">,
        isActive: newStatus,
        adminId: admin.id as Id<"admins">,
        reason: reason || undefined
      });

      toast({
        title: newStatus ? "User Activated" : "User Suspended",
        description: `${suspendingUser.fullName} has been ${newStatus ? 'activated' : 'suspended'} successfully.`,
      });

      setSuspendingUser(null);

    } catch (error) {
      console.error('Error updating user status:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update user status.",
        variant: "destructive",
      });
    } finally {
      setIsSuspending(false);
    }
  };

  const handleExportUsers = async () => {
    setIsExporting(true);

    try {
      const csvData = filteredAndSortedUsers.map(user => ({
        'User ID': user._id,
        'Full Name': user.fullName,
        'Email': user.email,
        'First Name': user.firstName,
        'Last Name': user.lastName,
        'Status': user.isActive ? 'Active' : 'Inactive',
        'Registration Date': new Date(user.createdAt).toLocaleDateString(),
        'Country': user.country || 'N/A',
        'Referral Code': user.referralCode || 'N/A',
        'Account Count': user.accountCount,
        'Active Accounts': user.activeAccounts,
        'Total Payments': user.totalPayments,
        'Total Spent': `$${user.totalSpent.toFixed(2)}`
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
      a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export Complete",
        description: `Exported ${filteredAndSortedUsers.length} users to CSV.`,
      });

    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export user data.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const getStatusBadgeVariant = (isActive: boolean) => {
    return isActive ? 'default' : 'secondary';
  };

  const getUserPaymentStats = (userId: string) => {
    const userPayments = payments.filter(p => p.user === userId);
    const successfulPayments = userPayments.filter(p => p.status === 'success');
    return {
      total: userPayments.length,
      successful: successfulPayments.length,
      totalAmount: successfulPayments.reduce((sum, p) => sum + p.amount, 0)
    };
  };

  if (rawUsers === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground">Manage platform users and their accounts</p>
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
              <Users className="w-5 h-5 opacity-80" />
              <div>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <p className="text-sm opacity-80">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{stats.activeUsers}</div>
                <p className="text-sm text-muted-foreground">Active Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{stats.affiliates}</div>
                <p className="text-sm text-muted-foreground">With Referral Code</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">{accounts.length}</div>
                <p className="text-sm text-muted-foreground">Trading Accounts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by email or name..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={(value) => {
                setStatusFilter(value);
                setCurrentPage(1);
              }}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Registration Date</SelectItem>
                  <SelectItem value="fullName">Name</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="isActive">Status</SelectItem>
                  <SelectItem value="accountCount">Account Count</SelectItem>
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
                  onClick={handleExportUsers}
                  variant="outline"
                  disabled={isExporting || filteredAndSortedUsers.length === 0}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isExporting ? "Exporting..." : "Export CSV"}
                </Button>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filteredAndSortedUsers.length)} of {filteredAndSortedUsers.length} users
                </span>
                <Select value={pageSize.toString()} onValueChange={(value) => {
                  setPageSize(Number(value));
                  setCurrentPage(1);
                }}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                    <SelectItem value="200">200</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Registration Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Trading Activity</TableHead>
                <TableHead>Payment History</TableHead>
                <TableHead>Referral Info</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers.map((user) => {
                const paymentStats = getUserPaymentStats(user._id);
                return (
                  <TableRow key={user._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {user.imageUrl && (
                          <img
                            src={user.imageUrl}
                            alt={user.fullName}
                            className="w-8 h-8 rounded-full"
                          />
                        )}
                        <div>
                          <div className="font-medium">{user.fullName}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                          {user.country && (
                            <div className="text-xs text-muted-foreground">📍 {user.country}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(user.createdAt).toLocaleDateString()}
                        <div className="text-xs text-muted-foreground">
                          {new Date(user.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(user.isActive)}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="flex items-center gap-1">
                          <Activity className="w-3 h-3" />
                          {user.accountCount} accounts
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {user.activeAccounts} active
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">${paymentStats.totalAmount.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">
                          {paymentStats.successful} payments
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {user.referralCode ? (
                          <div className="text-blue-600 font-mono text-xs">
                            {user.referralCode}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setViewingUser(user)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSuspendingUser(user)}
                        >
                          {user.isActive ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Page</span>
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        className="w-8 h-8 p-0"
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <span className="text-sm text-muted-foreground">of {totalPages}</span>
              </div>
            </div>
          )}

          {filteredAndSortedUsers.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No users found</p>
              <p className="text-sm">Try adjusting your search or filters.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View User Modal */}
      <Dialog open={!!viewingUser} onOpenChange={() => setViewingUser(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              User Details - {viewingUser?.fullName}
            </DialogTitle>
          </DialogHeader>
          {viewingUser && (
            <div className="space-y-6">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                      <p className="font-medium">{viewingUser.fullName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <p className="text-sm">{viewingUser.email}</p>
                    </div>
                    {viewingUser.country && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Country</label>
                        <p className="text-sm">{viewingUser.country}</p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Clerk ID</label>
                      <p className="text-xs font-mono bg-muted px-2 py-1 rounded">{viewingUser.clerkId}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Account Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Status</label>
                      <div className="mt-1">
                        <Badge variant={getStatusBadgeVariant(viewingUser.isActive)}>
                          {viewingUser.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Registered</label>
                      <p className="text-sm">
                        {new Date(viewingUser.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">User ID</label>
                      <p className="text-xs font-mono bg-muted px-2 py-1 rounded">{viewingUser._id}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Trading Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Trading Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{viewingUser.accountCount}</div>
                      <p className="text-sm text-muted-foreground">Total Accounts</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{viewingUser.activeAccounts}</div>
                      <p className="text-sm text-muted-foreground">Active Accounts</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{viewingUser.totalPayments}</div>
                      <p className="text-sm text-muted-foreground">Total Payments</p>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">${viewingUser.totalSpent.toLocaleString()}</div>
                      <p className="text-sm text-muted-foreground">Total Spent</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Referral Information */}
              {viewingUser.referralCode && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Referral Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Referral Code</label>
                      <p className="text-sm font-mono bg-muted px-2 py-1 rounded inline-block mt-1">
                        {viewingUser.referralCode}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Suspend/Activate User Confirmation Dialog */}
      <AlertDialog open={!!suspendingUser} onOpenChange={() => setSuspendingUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {suspendingUser?.isActive ? (
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              ) : (
                <CheckCircle className="w-5 h-5 text-green-600" />
              )}
              {suspendingUser?.isActive ? 'Suspend' : 'Activate'} User
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {suspendingUser?.isActive ? 'suspend' : 'activate'} user
              "<strong>{suspendingUser?.fullName}</strong>" ({suspendingUser?.email})?

              {suspendingUser?.isActive && suspendingUser?.activeAccounts > 0 && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-800">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="font-medium">Warning</span>
                  </div>
                  <p className="text-sm text-yellow-700 mt-1">
                    This user has {suspendingUser.activeAccounts} active trading accounts.
                    Suspending may affect their ability to participate in competitions.
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSuspending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleSuspendUser()}
              disabled={isSuspending}
              className={suspendingUser?.isActive ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
            >
              {isSuspending ? "Processing..." :
                (suspendingUser?.isActive ? 'Suspend User' : 'Activate User')
              }
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};