import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, X, Download, AlertCircle, DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { mockClaimRequests, mockTransactions, mockUsers, mockTraderAccounts, type ClaimRequest } from "@/lib/mockData";
import { useToast } from "@/hooks/use-toast";

export const FinancialManagement = () => {
  const [claimFilter, setClaimFilter] = useState<string>("all");
  const { toast } = useToast();

  const filteredClaims = mockClaimRequests.filter(claim => 
    claimFilter === "all" || claim.status === claimFilter
  );

  const pendingClaims = mockClaimRequests.filter(c => c.status === 'Pending');
  const totalClaimAmount = pendingClaims.reduce((sum, claim) => sum + claim.amount, 0);
  const totalTransactionVolume = mockTransactions.reduce((sum, tx) => sum + tx.amount, 0);
  const completedPayouts = mockTransactions.filter(tx => tx.type === 'Prize Payout' && tx.status === 'Completed');

  const handleApproveClaim = (claimId: string) => {
    toast({
      title: "Claim Approved",
      description: `Claim ${claimId} has been approved and payment is being processed.`,
    });
  };

  const handleRejectClaim = (claimId: string) => {
    toast({
      title: "Claim Rejected",
      description: `Claim ${claimId} has been rejected.`,
      variant: "destructive",
    });
  };

  const handleBatchApproval = () => {
    toast({
      title: "Batch Processing",
      description: `Processing ${pendingClaims.length} pending claims...`,
    });
  };

  const getUserByClaimId = (claim: ClaimRequest) => {
    return mockUsers.find(u => u.id === claim.userId);
  };

  const getTraderByClaimId = (claim: ClaimRequest) => {
    return mockTraderAccounts.find(acc => acc.id === claim.accountId);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Pending': return 'secondary';
      case 'Approved': return 'default';
      case 'Rejected': return 'destructive';
      default: return 'default';
    }
  };

  const getMethodBadgeColor = (method: string) => {
    switch (method) {
      case 'Withdraw': return 'bg-green-100 text-green-800';
      case 'PFH Credit': return 'bg-blue-100 text-blue-800';
      case 'TradeMind AI': return 'bg-purple-100 text-purple-800';
      default: return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold">{pendingClaims.length}</div>
                <p className="text-sm text-muted-foreground">Pending Claims</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-red-600" />
              <div>
                <div className="text-2xl font-bold">${totalClaimAmount.toLocaleString()}</div>
                <p className="text-sm text-muted-foreground">Pending Payouts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">${totalTransactionVolume.toLocaleString()}</div>
                <p className="text-sm text-muted-foreground">Total Volume</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{completedPayouts.length}</div>
                <p className="text-sm text-muted-foreground">Completed Payouts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Claims Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Prize Claims & Payouts</CardTitle>
            <div className="flex gap-2">
              <Select value={claimFilter} onValueChange={setClaimFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Claims</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button 
                onClick={handleBatchApproval}
                disabled={pendingClaims.length === 0}
              >
                Batch Approve ({pendingClaims.length})
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Claim ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Trader Account</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Request Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClaims.map((claim) => {
                const user = getUserByClaimId(claim);
                const trader = getTraderByClaimId(claim);
                
                return (
                  <TableRow key={claim.id}>
                    <TableCell className="font-mono text-sm">{claim.id}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user?.email}</div>
                        <div className="text-sm text-muted-foreground">{user?.fullName}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{trader?.traderName}</div>
                        <div className="text-sm text-muted-foreground">{trader?.mt5AccountNumber}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold">
                      ${claim.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge className={getMethodBadgeColor(claim.method)}>
                        {claim.method}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(claim.requestDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(claim.status)}>
                        {claim.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {claim.status === 'Pending' && (
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            onClick={() => handleApproveClaim(claim.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRejectClaim(claim.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                      {claim.status !== 'Pending' && (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {filteredClaims.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No claims found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>User</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTransactions.map((transaction) => {
                const user = mockUsers.find(u => u.id === transaction.userId);
                return (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-mono text-sm">{transaction.id}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{transaction.type}</Badge>
                    </TableCell>
                    <TableCell>{user?.email}</TableCell>
                    <TableCell className="text-right font-mono">
                      ${transaction.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>{transaction.paymentMethod}</TableCell>
                    <TableCell>{new Date(transaction.transactionDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={transaction.status === 'Completed' ? 'default' : 'secondary'}>
                        {transaction.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};