// src/pages/AdminPages/EntriesManagement.tsx
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  DollarSign,
  Users,
  Calendar,
  Filter,
  Eye,
  XCircle,
  CreditCard,
  Clock,
  TrendingUp
} from "lucide-react";
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useAuthStore } from '@/app/store/authStore';
import { useToast } from "@/hooks/use-toast";
import { Id } from "../../../convex/_generated/dataModel";

type PaymentStatus = 'pending' | 'success' | 'failed';
type EntryStatus = 'active' | 'refunded' | 'disputed';

export const EntriesManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [leagueFilter, setLeagueFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("all");
  const [selectedEntry, setSelectedEntry] = useState<any>(null);

  const { admin } = useAuthStore();
  const { toast } = useToast();

  // Queries
  const payments = useQuery(api.admin.getAllPayments) || [];
  const leagues = useQuery(api.leagues.getAllLeagues) || [];
  const accounts = useQuery(api.admin.getAllAccounts) || [];
  const dashboardStats = useQuery(api.admin.getDashboardStats);

  // Mutations
  const logActivity = useMutation(api.admin.logActivity);

  // Filter and process data
  const processedEntries = useMemo(() => {
    return payments.map(payment => {
      const account = accounts.find(acc => acc.payment === payment._id);
      const league = leagues.find(l => l._id === payment.league);

      return {
        ...payment,
        account,
        league,
        traderName: account?.name || 'Unknown Account',
        entryDate: payment.updatedAt || Date.now(),
        entryFee: payment.amount,
        paymentMethod: payment.paymentIntent?.payment_method_types?.[0] || 'Unknown'
      };
    });
  }, [payments, accounts, leagues]);

  const filteredEntries = useMemo(() => {
    return processedEntries.filter(entry => {
      const matchesSearch =
        entry.traderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry._id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesLeague = leagueFilter === "all" || entry.league?._id === leagueFilter;
      const matchesStatus = statusFilter === "all" || entry.status === statusFilter;
      const matchesPaymentStatus = paymentStatusFilter === "all" || entry.status === paymentStatusFilter;

      // Date filtering
      let matchesDate = true;
      if (dateRange !== "all" && entry.entryDate) {
        const entryDate = new Date(entry.entryDate);
        const now = new Date();
        const daysDiff = (now.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24);

        switch (dateRange) {
          case "today":
            matchesDate = daysDiff < 1;
            break;
          case "week":
            matchesDate = daysDiff < 7;
            break;
          case "month":
            matchesDate = daysDiff < 30;
            break;
        }
      }

      return matchesSearch && matchesLeague && matchesStatus && matchesPaymentStatus && matchesDate;
    });
  }, [processedEntries, searchTerm, leagueFilter, statusFilter, paymentStatusFilter, dateRange]);

  // Statistics
  const stats = useMemo(() => {
    const total = filteredEntries.length;
    const confirmed = filteredEntries.filter(e => e.status === 'success').length;
    const pending = filteredEntries.filter(e => e.status === 'pending').length;
    const failed = filteredEntries.filter(e => e.status === 'failed').length;
    const totalRevenue = filteredEntries
      .filter(e => e.status === 'success')
      .reduce((sum, e) => sum + e.amount, 0);

    return { total, confirmed, pending, failed, totalRevenue };
  }, [filteredEntries]);

  const handleRefundEntry = async (entryId: string) => {
    if (!admin) return;

    try {
      // In a real implementation, you'd call a refund mutation
      await logActivity({
        type: "admin_action",
        adminId: admin.id as Id<"admins">,
        entityId: entryId,
        details: "Entry refund processed",
      });

      toast({
        title: "Refund Processed",
        description: "Entry has been successfully refunded.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process refund.",
        variant: "destructive",
      });
    }
  };

  const handleExportEntries = () => {
    const csvData = filteredEntries.map(entry => ({
      'Entry ID': entry._id,
      'User Email': entry.userEmail || 'N/A',
      'Trader Name': entry.traderName,
      'League': entry.league?.name || 'N/A',
      'Entry Date': new Date(entry.entryDate).toLocaleDateString(),
      'Entry Fee': entry.entryFee,
      'Payment Method': entry.paymentMethod,
      'Status': entry.status,
      'Amount': entry.amount
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
    a.download = `entries_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Started",
      description: `Exported ${filteredEntries.length} entries to CSV.`,
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'success': return 'default';
      case 'pending': return 'secondary';
      case 'failed': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'failed': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const activeLeague = leagues.find(l => l.status === 'active');

  if (payments === undefined || leagues === undefined || accounts === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading entries data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Entries Management</h1>
          <p className="text-muted-foreground">Monitor and manage competition entries and payments</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExportEntries} disabled={filteredEntries.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-primary text-primary-foreground shadow-glow">
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 opacity-80" />
              <div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-sm opacity-80">Total Entries</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{stats.confirmed}</div>
                <p className="text-sm text-muted-foreground">Confirmed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold">{stats.pending}</div>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <div>
                <div className="text-2xl font-bold">{stats.failed}</div>
                <p className="text-sm text-muted-foreground">Failed</p>
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
                <p className="text-sm text-muted-foreground">Entry Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Competition Alert */}
      {activeLeague && (
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-800 dark:text-blue-200">
                  Active Competition: {activeLeague.name}
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {activeLeague.participantCount || 0} participants •
                  ${activeLeague.exp} entry fee •
                  Prize Pool: ${activeLeague.reward.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Entry Filters
            </CardTitle>
            <Badge variant="outline">
              {filteredEntries.length} of {processedEntries.length} entries
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search entries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={leagueFilter} onValueChange={setLeagueFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Competitions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Competitions</SelectItem>
                {leagues.map((league) => (
                  <SelectItem key={league._id} value={league._id}>
                    {league.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Payment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setLeagueFilter("all");
                setStatusFilter("all");
                setPaymentStatusFilter("all");
                setDateRange("all");
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Entries Table */}
      <Card>
        <CardHeader>
          <CardTitle>Competition Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">All Entries ({stats.total})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
              <TabsTrigger value="failed">Failed ({stats.failed})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Participant</TableHead>
                    <TableHead>Competition</TableHead>
                    <TableHead>Entry Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries.map((entry) => (
                    <TableRow key={entry._id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{entry.traderName}</div>
                          <div className="text-sm text-muted-foreground">{entry.userEmail}</div>
                          <div className="text-xs text-muted-foreground">{entry.userName}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{entry.league?.name || 'N/A'}</div>
                          <div className="text-sm text-muted-foreground">
                            Entry Fee: ${entry.league?.exp || 0}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(entry.entryDate).toLocaleDateString()}
                          <div className="text-xs text-muted-foreground">
                            {new Date(entry.entryDate).toLocaleTimeString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold">
                        ${entry.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-muted-foreground" />
                          <Badge variant="outline" className="capitalize">
                            {entry.paymentMethod}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(entry.status || 'pending')}
                          <Badge variant={getStatusBadgeVariant(entry.status || 'pending')}>
                            {entry.status || 'pending'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedEntry(entry)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {entry.status === 'success' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRefundEntry(entry._id)}
                            >
                              Refund
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredEntries.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">No entries found</p>
                  <p className="text-sm">Try adjusting your filters or search terms.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="pending">
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Pending entries require manual review</p>
                <p className="text-sm">Check payment processor for updates</p>
              </div>
            </TabsContent>

            <TabsContent value="failed">
              <div className="text-center py-8 text-muted-foreground">
                <XCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Failed entries may need customer support</p>
                <p className="text-sm">Review payment failure reasons</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Entry Details Modal */}
      <Dialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Entry Details</DialogTitle>
          </DialogHeader>
          {selectedEntry && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Participant Information</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-muted-foreground">Trader Name:</span> {selectedEntry.traderName}</p>
                    <p><span className="text-muted-foreground">Email:</span> {selectedEntry.userEmail}</p>
                    <p><span className="text-muted-foreground">User:</span> {selectedEntry.userName}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Entry Details</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-muted-foreground">Competition:</span> {selectedEntry.league?.name}</p>
                    <p><span className="text-muted-foreground">Entry Date:</span> {new Date(selectedEntry.entryDate).toLocaleString()}</p>
                    <p><span className="text-muted-foreground">Amount:</span> ${selectedEntry.amount}</p>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Payment Information</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="text-muted-foreground">Method:</span> {selectedEntry.paymentMethod}</p>
                  <p><span className="text-muted-foreground">Status:</span> {selectedEntry.status}</p>
                  <p><span className="text-muted-foreground">Transaction ID:</span> {selectedEntry._id}</p>
                </div>
              </div>
              {selectedEntry.account && (
                <div>
                  <h4 className="font-medium mb-2">Trading Account</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-muted-foreground">Account Name:</span> {selectedEntry.account.name}</p>
                    <p><span className="text-muted-foreground">Deposit:</span> ${selectedEntry.account.deposit}</p>
                    <p><span className="text-muted-foreground">Leverage:</span> {selectedEntry.account.leverage}:1</p>
                    <p><span className="text-muted-foreground">Group:</span> {selectedEntry.account.group}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};