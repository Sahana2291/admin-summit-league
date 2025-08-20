import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Users, DollarSign, TrendingUp, Gift } from "lucide-react";
import { mockAffiliateCommissions, mockUsers, mockCompetitions, type AffiliateCommission } from "@/lib/mockData";
import { useToast } from "@/hooks/use-toast";

export const AffiliateManagement = () => {
  const [weekFilter, setWeekFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast } = useToast();

  const filteredCommissions = mockAffiliateCommissions.filter(commission => {
    const matchesWeek = weekFilter === "all" || commission.weekId === weekFilter;
    const matchesStatus = statusFilter === "all" || commission.status === statusFilter;
    return matchesWeek && matchesStatus;
  });

  const totalCommissions = mockAffiliateCommissions.reduce((sum, comm) => sum + comm.commissionAmount, 0);
  const pendingCommissions = mockAffiliateCommissions.filter(c => c.status === 'Pending').length;
  const activeAffiliates = new Set(mockAffiliateCommissions.map(c => c.affiliateUserId)).size;
  const totalReferrals = mockAffiliateCommissions.length;

  const handlePayCommissions = () => {
    toast({
      title: "Commissions Paid",
      description: "All pending affiliate commissions have been processed.",
    });
  };

  const handleExportCommissions = () => {
    toast({
      title: "Export Started",
      description: "Affiliate commission report is being generated...",
    });
  };

  const getUserById = (userId: string) => {
    return mockUsers.find(u => u.id === userId);
  };

  const getWeekName = (weekId: string) => {
    const comp = mockCompetitions.find(c => c.id === weekId);
    return comp ? `Week ${comp.weekNumber}` : weekId;
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Pending': return 'secondary';
      case 'Paid': return 'default';
      default: return 'default';
    }
  };

  // Calculate affiliate performance metrics
  const affiliateStats = mockUsers
    .filter(user => user.affiliateCode)
    .map(affiliate => {
      const commissions = mockAffiliateCommissions.filter(c => c.affiliateUserId === affiliate.id);
      const totalEarned = commissions.reduce((sum, c) => sum + c.commissionAmount, 0);
      const referralCount = commissions.length;
      
      return {
        ...affiliate,
        totalEarned,
        referralCount,
        averageCommission: referralCount > 0 ? totalEarned / referralCount : 0
      };
    })
    .sort((a, b) => b.totalEarned - a.totalEarned);

  return (
    <div className="space-y-6">
      {/* Affiliate Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{activeAffiliates}</div>
                <p className="text-sm text-muted-foreground">Active Affiliates</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{totalReferrals}</div>
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
                <div className="text-2xl font-bold">${totalCommissions.toLocaleString()}</div>
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
                <div className="text-2xl font-bold">{pendingCommissions}</div>
                <p className="text-sm text-muted-foreground">Pending Payments</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
                <TableHead className="text-right">Total Earned</TableHead>
                <TableHead className="text-right">Avg Commission</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {affiliateStats.map((affiliate) => (
                <TableRow key={affiliate.id}>
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
                  <TableCell className="text-right font-mono font-bold">
                    ${affiliate.totalEarned.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    ${affiliate.averageCommission.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="default">{affiliate.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Commission Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Affiliate Commissions</CardTitle>
            <div className="flex gap-2">
              <Select value={weekFilter} onValueChange={setWeekFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter week" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Weeks</SelectItem>
                  {mockCompetitions.map((comp) => (
                    <SelectItem key={comp.id} value={comp.id}>
                      Week {comp.weekNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={handleExportCommissions}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button onClick={handlePayCommissions} disabled={pendingCommissions === 0}>
                Pay Commissions ({pendingCommissions})
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Week</TableHead>
                <TableHead>Affiliate</TableHead>
                <TableHead>Referred User</TableHead>
                <TableHead>Affiliate Code</TableHead>
                <TableHead className="text-right">Entry Fee</TableHead>
                <TableHead className="text-right">Commission Rate</TableHead>
                <TableHead className="text-right">Commission Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCommissions.map((commission) => {
                const affiliate = getUserById(commission.affiliateUserId);
                const referred = getUserById(commission.referredUserId);
                
                return (
                  <TableRow key={commission.id}>
                    <TableCell>
                      <Badge variant="outline">{getWeekName(commission.weekId)}</Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{affiliate?.fullName}</div>
                        <div className="text-sm text-muted-foreground">{affiliate?.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{referred?.fullName}</div>
                        <div className="text-sm text-muted-foreground">{referred?.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{affiliate?.affiliateCode}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      ${commission.entryFeeAmount}
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
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {filteredCommissions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No commissions found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Commission Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Commission Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Total Commissions (All Time)</div>
              <div className="text-2xl font-bold">${totalCommissions.toFixed(2)}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Pending Payouts</div>
              <div className="text-2xl font-bold text-yellow-600">
                ${mockAffiliateCommissions
                  .filter(c => c.status === 'Pending')
                  .reduce((sum, c) => sum + c.commissionAmount, 0)
                  .toFixed(2)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};