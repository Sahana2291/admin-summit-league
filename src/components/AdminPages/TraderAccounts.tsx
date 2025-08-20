import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Download, Plus, Eye, Ban, AlertTriangle } from "lucide-react";
import { mockTraderAccounts, mockUsers, type TraderAccount } from "@/lib/mockData";
import { useToast } from "@/hooks/use-toast";

export const TraderAccounts = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast } = useToast();

  const filteredAccounts = mockTraderAccounts.filter(account => {
    const user = mockUsers.find(u => u.id === account.userId);
    const matchesSearch = account.traderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.mt5AccountNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user?.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === "all" || account.accountStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getUserByAccountId = (userId: string) => {
    return mockUsers.find(u => u.id === userId);
  };

  const getMultipleAccountUsers = () => {
    const userAccountCounts = new Map();
    mockTraderAccounts.forEach(acc => {
      const count = userAccountCounts.get(acc.userId) || 0;
      userAccountCounts.set(acc.userId, count + 1);
    });
    return Array.from(userAccountCounts.entries()).filter(([_, count]) => count > 1);
  };

  const handleSuspendAccount = (accountId: string) => {
    toast({
      title: "Account Suspended",
      description: "Trading account has been suspended successfully.",
    });
  };

  const handleViewAccount = (accountId: string) => {
    toast({
      title: "Account Details",
      description: "Opening account details...",
    });
  };

  const handleExportAccounts = () => {
    toast({
      title: "Export Started",
      description: "Account data export is being generated...",
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Active': return 'default';
      case 'Inactive': return 'secondary';
      case 'Suspended': return 'destructive';
      default: return 'default';
    }
  };

  const multipleAccountUsers = getMultipleAccountUsers();

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{mockTraderAccounts.length}</div>
            <p className="text-sm text-muted-foreground">Total Accounts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{mockTraderAccounts.filter(a => a.accountStatus === 'Active').length}</div>
            <p className="text-sm text-muted-foreground">Active Accounts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{multipleAccountUsers.length}</div>
            <p className="text-sm text-muted-foreground">Multi-Account Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{(mockTraderAccounts.length / mockUsers.length).toFixed(1)}</div>
            <p className="text-sm text-muted-foreground">Avg Accounts/User</p>
          </CardContent>
        </Card>
      </div>

      {/* Multiple Account Alert */}
      {multipleAccountUsers.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800">Multiple Account Detection</p>
                <p className="text-sm text-yellow-700">
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
          <CardTitle>Trading Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by trader name, MT5 account, or email..."
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
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
                <SelectItem value="Suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleExportAccounts} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Account
            </Button>
          </div>

          {/* Accounts Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Trader</TableHead>
                <TableHead>User Email</TableHead>
                <TableHead>MT5 Account</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead>Week Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAccounts.map((account) => {
                const user = getUserByAccountId(account.userId);
                const userAccountCount = mockTraderAccounts.filter(a => a.userId === account.userId).length;
                
                return (
                  <TableRow key={account.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="font-medium">{account.traderName}</div>
                        {userAccountCount > 1 && (
                          <Badge variant="outline" className="text-xs">
                            +{userAccountCount - 1} more
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">{user?.email}</div>
                        <div className="text-xs text-muted-foreground">{user?.fullName}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{account.mt5AccountNumber}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(account.accountStatus)}>
                        {account.accountStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(account.createdDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline">Week {account.weekJoined}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewAccount(account.id)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSuspendAccount(account.id)}
                          disabled={account.accountStatus !== 'Active'}
                        >
                          <Ban className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {filteredAccounts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No accounts found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};