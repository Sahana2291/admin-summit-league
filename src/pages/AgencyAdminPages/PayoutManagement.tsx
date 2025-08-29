import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, DollarSign, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import { mockPayouts } from "@/lib/affiliateData";

export const PayoutManagement = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("current");

  // Extended mock data for better demonstration
  const payouts = [
    ...mockPayouts,
    {
      id: 'payout-003',
      agencyId: 'ag-001',
      period: 'June 2024',
      grossCommissions: 15200,
      adjustments: -450,
      netPayable: 14750,
      status: 'Paid' as const,
      createdAt: new Date('2024-07-01')
    },
    {
      id: 'payout-004',
      agencyId: 'ag-001',
      period: 'May 2024',
      grossCommissions: 9800,
      adjustments: 0,
      netPayable: 9800,
      status: 'Paid' as const,
      createdAt: new Date('2024-06-01')
    }
  ];

  const currentPayout = payouts.find(p => p.period === 'August 2024');
  const totalEarned = payouts.filter(p => p.status === 'Paid').reduce((sum, p) => sum + p.netPayable, 0);
  const pendingAmount = payouts.filter(p => p.status === 'Pending').reduce((sum, p) => sum + p.netPayable, 0);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Paid": return "default";
      case "Processing": return "outline";
      case "Pending": return "secondary";
      case "On Hold": return "destructive";
      default: return "secondary";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Paid": return CheckCircle;
      case "Processing": return TrendingUp;
      case "Pending": return AlertCircle;
      case "On Hold": return AlertCircle;
      default: return AlertCircle;
    }
  };

  const downloadStatement = (payoutId: string) => {
    // Mock download functionality
    console.log(`Downloading statement for payout ${payoutId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payout Management</h1>
          <p className="text-muted-foreground">Track commissions and download statements</p>
        </div>
        <div className="flex space-x-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">Current Period</SelectItem>
              <SelectItem value="last3">Last 3 Months</SelectItem>
              <SelectItem value="last6">Last 6 Months</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Earned</p>
                <p className="text-2xl font-bold">${totalEarned.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">All-time commissions</p>
              </div>
              <div className="h-12 w-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Payout</p>
                <p className="text-2xl font-bold">${pendingAmount.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">Current period</p>
              </div>
              <div className="h-12 w-12 bg-orange-500/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">${currentPayout?.grossCommissions.toLocaleString() || '0'}</p>
                <p className="text-xs text-muted-foreground mt-1">Gross commissions</p>
              </div>
              <div className="h-12 w-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Period Breakdown */}
      {currentPayout && (
        <Card>
          <CardHeader>
            <CardTitle>Current Period Summary</CardTitle>
            <CardDescription>{currentPayout.period} - Detailed breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-muted/20 rounded-lg">
                <span className="font-medium">Gross Commissions</span>
                <span className="text-lg font-bold text-green-600">
                  +${currentPayout.grossCommissions.toLocaleString()}
                </span>
              </div>
              
              {currentPayout.adjustments !== 0 && (
                <div className="flex justify-between items-center p-4 bg-muted/30 rounded-lg">
                  <span className="font-medium">Adjustments</span>
                  <span className={`text-lg font-bold ${currentPayout.adjustments < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {currentPayout.adjustments < 0 ? '' : '+'}{currentPayout.adjustments.toLocaleString()}
                  </span>
                </div>
              )}
              
              <div className="flex justify-between items-center p-4 bg-primary/10 rounded-lg border-2 border-primary/20">
                <span className="font-bold">Net Payable</span>
                <span className="text-xl font-bold text-primary">
                  ${currentPayout.netPayable.toLocaleString()}
                </span>
              </div>

              {currentPayout.adjustments < 0 && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm font-medium text-amber-800">Adjustment Details</p>
                  <p className="text-sm text-amber-700 mt-1">
                    Fraud reversals and chargebacks from previous periods
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payout History */}
      <Card>
        <CardHeader>
          <CardTitle>Payout History</CardTitle>
          <CardDescription>View and download past payout statements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead>Gross Commissions</TableHead>
                  <TableHead>Adjustments</TableHead>
                  <TableHead>Net Payable</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payouts.map((payout) => {
                  const StatusIcon = getStatusIcon(payout.status);
                  return (
                    <TableRow key={payout.id}>
                      <TableCell className="font-medium">{payout.period}</TableCell>
                      <TableCell>${payout.grossCommissions.toLocaleString()}</TableCell>
                      <TableCell>
                        <span className={payout.adjustments < 0 ? 'text-red-600' : payout.adjustments > 0 ? 'text-green-600' : ''}>
                          {payout.adjustments === 0 ? '-' : `$${payout.adjustments.toLocaleString()}`}
                        </span>
                      </TableCell>
                      <TableCell className="font-bold">
                        ${payout.netPayable.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <StatusIcon className="w-4 h-4" />
                          <Badge variant={getStatusBadgeVariant(payout.status)}>
                            {payout.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>{payout.createdAt.toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button
                          onClick={() => downloadStatement(payout.id)}
                          variant="outline"
                          size="sm"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Payment Information */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Information</CardTitle>
          <CardDescription>How and when you receive payments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Payment Method</h4>
                <p className="text-sm text-muted-foreground">Bank Transfer (USD)</p>
                <p className="text-sm">Processing time: 3-5 business days</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Payment Schedule</h4>
                <p className="text-sm text-muted-foreground">Monthly</p>
                <p className="text-sm">Payouts processed by the 5th of each month</p>
              </div>
            </div>
            
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-blue-800">Next Payout</p>
              <p className="text-sm text-blue-700 mt-1">
                Your August 2024 payout of ${currentPayout?.netPayable.toLocaleString() || '0'} 
                will be processed on September 5th, 2024.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};