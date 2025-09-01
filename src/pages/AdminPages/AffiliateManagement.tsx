import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Users, DollarSign, TrendingUp, Gift, CheckCircle, AlertTriangle, Settings } from "lucide-react";
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from '@/app/store/authStore';
import { Id } from "../../../convex/_generated/dataModel";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { AllSettings } from "@/types/admin";

export const AffiliateManagement = () => {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedCommissions, setSelectedCommissions] = useState<string[]>([]);
  const [isPayingCommissions, setIsPayingCommissions] = useState(false);

  const { admin } = useAuthStore();
  const { toast } = useToast();

  // Queries
  const affiliateStats = useQuery(api.admin.getAffiliateStats) || {
    activeAffiliates: 0,
    totalReferrals: 0,
    totalCommissions: 0,
    pendingCommissions: 0,
    pendingAmount: 0,
    completedReferrals: 0,
    averageCommissionPerReferral: 0
  };

  const topAffiliates = useQuery(api.admin.getTopAffiliates, { limit: 10 }) || [];

  const allCommissions = useQuery(api.admin.getAllCommissions, {
    status: statusFilter === "all" ? undefined : statusFilter as any,
    limit: 100
  }) || [];

  const settings = useQuery(api.admin.getSystemSettings) as AllSettings | undefined;

  // Mutations
  const payCommissions = useMutation(api.admin.payCommissions);
  const cancelCommission = useMutation(api.admin.cancelCommission);

  const handlePaySelectedCommissions = async () => {
    if (!admin || selectedCommissions.length === 0) return;
    setIsPayingCommissions(true);

    try {
      const result = await payCommissions({
        commissionIds: selectedCommissions as Id<"affiliate_commissions">[],
        payoutMethod: "admin_manual"
      });

      toast({
        title: "Commissions Processed",
        description: `${result.successful} commissions paid successfully. ${result.failed} failed.`,
      });

      setSelectedCommissions([]);
    } catch (error) {
      console.error('Error paying commissions:', error);
      toast({
        title: "Error",
        description: "Failed to process commission payments. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPayingCommissions(false);
    }
  };

  const handleCancelCommission = async (commissionId: string) => {
    if (!admin) return;

    try {
      await cancelCommission({
        commissionId: commissionId as Id<"affiliate_commissions">,
        reason: "Cancelled by admin"
      });

      toast({
        title: "Commission Cancelled",
        description: "Commission has been cancelled successfully.",
      });
    } catch (error) {
      console.error('Error cancelling commission:', error);
      toast({
        title: "Error",
        description: "Failed to cancel commission. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExportCommissions = () => {
    if (allCommissions.length === 0) {
      toast({
        title: "No Data",
        description: "No commission data available to export.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Generate CSV export
      const csvData = allCommissions.map(commission => ({
        'Affiliate Name': commission.affiliate?.fullName || 'N/A',
        'Affiliate Email': commission.affiliate?.email || 'N/A',
        'Affiliate Code': commission.affiliate?.affiliateCode || 'N/A',
        'Referred User': commission.referred?.fullName || 'N/A',
        'League': commission.leagueName || 'N/A',
        'Entry Fee': `$${commission.entryFeeAmount}`,
        'Commission Rate': `${(commission.commissionRate * 100).toFixed(1)}%`,
        'Commission Amount': `$${commission.commissionAmount.toFixed(2)}`,
        'Status': commission.status,
        'Calculated Date': new Date(commission.calculatedAt).toLocaleDateString(),
        'Paid Date': commission.paidAt ? new Date(commission.paidAt).toLocaleDateString() : 'N/A'
      }));

      const csvString = [
        Object.keys(csvData[0]).join(','),
        ...csvData.map(row => Object.values(row).join(','))
      ].join('\n');

      const blob = new Blob([csvString], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `affiliate_commissions_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export Complete",
        description: "Affiliate commission report has been downloaded.",
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export commission data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSelectCommission = (commissionId: string, checked: boolean) => {
    if (checked) {
      setSelectedCommissions(prev => [...prev, commissionId]);
    } else {
      setSelectedCommissions(prev => prev.filter(id => id !== commissionId));
    }
  };

  const handleSelectAllCommissions = (checked: boolean) => {
    if (checked) {
      const pendingCommissions = allCommissions
        .filter(c => c.status === 'pending')
        .map(c => c._id);
      setSelectedCommissions(pendingCommissions);
    } else {
      setSelectedCommissions([]);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'paid': return 'default';
      case 'cancelled': return 'destructive';
      default: return 'default';
    }
  };

  const pendingCommissions = allCommissions.filter(c => c.status === 'pending');
  const selectedAmount = pendingCommissions
    .filter(c => selectedCommissions.includes(c._id))
    .reduce((sum, c) => sum + c.commissionAmount, 0);

  if (affiliateStats === undefined || topAffiliates === undefined || allCommissions === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading affiliate data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Affiliate Management</h1>
          <p className="text-muted-foreground">Track referrals, commissions, and affiliate performance</p>
        </div>
        <Button variant="outline" asChild>
          <a href="/admin/settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Affiliate Settings
          </a>
        </Button>
      </div>

      {/* Affiliate Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-primary text-primary-foreground shadow-glow">
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 opacity-80" />
              <div>
                <div className="text-2xl font-bold">{affiliateStats.activeAffiliates}</div>
                <p className="text-sm opacity-80">Active Affiliates</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{affiliateStats.totalReferrals}</div>
                <p className="text-sm text-muted-foreground">Total Referrals</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">${affiliateStats.totalCommissions.toFixed(2)}</div>
                <p className="text-sm text-muted-foreground">Total Commissions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold">{affiliateStats.pendingCommissions}</div>
                <p className="text-sm text-muted-foreground">Pending Payments</p>
                <p className="text-xs text-yellow-600 font-medium">
                  ${affiliateStats.pendingAmount.toFixed(2)} pending
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Settings Display */}
      {settings.affiliate && Object.keys(settings.affiliate).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Current Affiliate Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Commission Rate:</span>
                <span className="font-medium">{(settings.affiliate.commissionRate * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Min Payout:</span>
                <span className="font-medium">${settings.affiliate.minPayout}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payout Schedule:</span>
                <span className="font-medium capitalize">{settings.affiliate.payoutSchedule}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Code Length:</span>
                <span className="font-medium">{settings.affiliate.referralCodeLength} chars</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Affiliates */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Affiliates</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Affiliate</TableHead>
                <TableHead>Code</TableHead>
                <TableHead className="text-right">Referrals</TableHead>
                <TableHead className="text-right">Completed</TableHead>
                <TableHead className="text-right">Total Earned</TableHead>
                <TableHead className="text-right">Pending</TableHead>
                <TableHead className="text-right">Avg Commission</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topAffiliates.map((affiliate) => (
                <TableRow key={affiliate.userId}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{affiliate.fullName}</div>
                      <div className="text-sm text-muted-foreground">{affiliate.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{affiliate.affiliateCode}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono">{affiliate.referralCount}</TableCell>
                  <TableCell className="text-right font-mono">{affiliate.completedReferrals}</TableCell>
                  <TableCell className="text-right font-mono font-bold text-green-600">
                    ${affiliate.totalEarned.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-yellow-600">
                    ${affiliate.pendingEarnings.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    ${affiliate.averageCommission.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {topAffiliates.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No active affiliates yet.</p>
              <p className="text-sm">Users with referral codes will appear here once they start referring others.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Commission Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Affiliate Commissions</CardTitle>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={handleExportCommissions}
                disabled={allCommissions.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Export ({allCommissions.length})
              </Button>
              {selectedCommissions.length > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      disabled={isPayingCommissions}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Pay Selected ({selectedCommissions.length})
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm Commission Payments</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to mark {selectedCommissions.length} commissions as paid?
                        <br />
                        <strong>Total amount: ${selectedAmount.toFixed(2)}</strong>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handlePaySelectedCommissions}>
                        {isPayingCommissions ? "Processing..." : "Confirm Payment"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={selectedCommissions.length === pendingCommissions.length && pendingCommissions.length > 0}
                    onChange={(e) => handleSelectAllCommissions(e.target.checked)}
                    disabled={pendingCommissions.length === 0}
                  />
                </TableHead>
                <TableHead>Affiliate</TableHead>
                <TableHead>Referred User</TableHead>
                <TableHead>League</TableHead>
                <TableHead className="text-right">Entry Fee</TableHead>
                <TableHead className="text-right">Rate</TableHead>
                <TableHead className="text-right">Commission</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allCommissions.map((commission) => (
                <TableRow key={commission._id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedCommissions.includes(commission._id)}
                      onChange={(e) => handleSelectCommission(commission._id, e.target.checked)}
                      disabled={commission.status !== 'pending'}
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{commission.affiliate?.fullName || 'N/A'}</div>
                      <div className="text-sm text-muted-foreground">{commission.affiliate?.email}</div>
                      <Badge variant="outline" className="mt-1">
                        {commission.affiliate?.affiliateCode}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{commission.referred?.fullName || 'N/A'}</div>
                      <div className="text-sm text-muted-foreground">{commission.referred?.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{commission.leagueName || 'N/A'}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    ${commission.entryFeeAmount.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {(commission.commissionRate * 100).toFixed(1)}%
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold">
                    ${commission.commissionAmount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(commission.status)}>
                      {commission.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    <div>{new Date(commission.calculatedAt).toLocaleDateString()}</div>
                    {commission.paidAt && (
                      <div className="text-muted-foreground">
                        Paid: {new Date(commission.paidAt).toLocaleDateString()}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {commission.status === 'pending' && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                          >
                            <AlertTriangle className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Cancel Commission</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to cancel this commission of ${commission.commissionAmount.toFixed(2)}?
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Keep Commission</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleCancelCommission(commission._id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Cancel Commission
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {allCommissions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No commissions found.</p>
              <p className="text-sm">Commission records will appear here when referrals make successful payments.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Commission Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Commission Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Commissions:</span>
                <span className="font-bold">${affiliateStats.totalCommissions.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pending Payouts:</span>
                <span className="font-bold text-yellow-600">${affiliateStats.pendingAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Paid Commissions:</span>
                <span className="font-bold text-green-600">
                  ${(affiliateStats.totalCommissions - affiliateStats.pendingAmount).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Average per Referral:</span>
                <span className="font-bold">${affiliateStats.averageCommissionPerReferral.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Referral Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Referrals:</span>
                <span className="font-bold">{affiliateStats.totalReferrals}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Completed Referrals:</span>
                <span className="font-bold text-green-600">{affiliateStats.completedReferrals}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Success Rate:</span>
                <span className="font-bold">
                  {affiliateStats.totalReferrals > 0
                    ? ((affiliateStats.completedReferrals / affiliateStats.totalReferrals) * 100).toFixed(1)
                    : '0.0'
                  }%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Active Affiliates:</span>
                <span className="font-bold">{affiliateStats.activeAffiliates}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};