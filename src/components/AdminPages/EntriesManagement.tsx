import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Download, RefreshCw, AlertCircle, CheckCircle, DollarSign, Users, Calendar } from "lucide-react";
import { mockCompetitions, mockUsers, mockTraderAccounts } from "@/lib/mockData";
import { useToast } from "@/hooks/use-toast";

// Mock entry data
const mockEntries = [
  {
    id: "entry1",
    userId: "1",
    weekId: "comp35",
    traderName: "AlphaWolf",
    accountId: "acc1",
    entryDate: "2024-12-16T10:30:00Z",
    entryFee: 50,
    status: "Confirmed",
    paymentMethod: "Credit Card",
    transactionId: "tx_12345"
  },
  {
    id: "entry2",
    userId: "2",
    weekId: "comp35",
    traderName: "TraderPro_88",
    accountId: "acc3",
    entryDate: "2024-12-16T09:15:00Z",
    entryFee: 50,
    status: "Confirmed",
    paymentMethod: "PayPal",
    transactionId: "tx_12346"
  },
  {
    id: "entry3",
    userId: "3",
    weekId: "comp35",
    traderName: "MarketMaster",
    accountId: "acc4",
    entryDate: "2024-12-16T11:45:00Z",
    entryFee: 50,
    status: "Pending",
    paymentMethod: "Bank Transfer",
    transactionId: "tx_12347"
  },
  {
    id: "entry4",
    userId: "1",
    weekId: "comp34",
    traderName: "Wolf_2",
    accountId: "acc2",
    entryDate: "2024-12-09T14:20:00Z",
    entryFee: 50,
    status: "Refunded",
    paymentMethod: "Credit Card",
    transactionId: "tx_12348"
  }
];

export const EntriesManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [weekFilter, setWeekFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast } = useToast();

  const activeWeek = mockCompetitions.find(comp => comp.status === 'Active') || mockCompetitions[0];
  
  const filteredEntries = mockEntries.filter(entry => {
    const user = mockUsers.find(u => u.id === entry.userId);
    const matchesSearch = entry.traderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.transactionId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesWeek = weekFilter === "all" || entry.weekId === weekFilter;
    const matchesStatus = statusFilter === "all" || entry.status === statusFilter;
    return matchesSearch && matchesWeek && matchesStatus;
  });

  const totalEntries = filteredEntries.length;
  const confirmedEntries = filteredEntries.filter(e => e.status === 'Confirmed').length;
  const pendingEntries = filteredEntries.filter(e => e.status === 'Pending').length;
  const totalRevenue = filteredEntries.filter(e => e.status === 'Confirmed').reduce((sum, e) => sum + e.entryFee, 0);

  const getUserByEntry = (entry: any) => {
    return mockUsers.find(u => u.id === entry.userId);
  };

  const getCompetitionByEntry = (entry: any) => {
    return mockCompetitions.find(c => c.id === entry.weekId);
  };

  const handleRefundEntry = (entryId: string) => {
    toast({
      title: "Refund Processed",
      description: `Entry ${entryId} has been refunded successfully.`,
    });
  };

  const handleExportEntries = () => {
    toast({
      title: "Export Started",
      description: "Entries data export is being generated...",
    });
  };

  const handleRefreshEntries = () => {
    toast({
      title: "Data Refreshed",
      description: "Entry data has been refreshed from payment processors.",
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Confirmed': return 'default';
      case 'Pending': return 'secondary';
      case 'Refunded': return 'destructive';
      case 'Failed': return 'destructive';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'Pending': return <AlertCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{totalEntries}</div>
                <p className="text-sm text-muted-foreground">Total Entries</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{confirmedEntries}</div>
                <p className="text-sm text-muted-foreground">Confirmed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold">{pendingEntries}</div>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
                <p className="text-sm text-muted-foreground">Entry Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Week Info */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-medium text-blue-800">Active Competition: Week {activeWeek.weekNumber}</p>
              <p className="text-sm text-blue-700">
                {activeWeek.totalParticipants.toLocaleString()} participants • ${activeWeek.entryFee} entry fee • 
                Prize Pool: ${activeWeek.totalPrizePool.toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Controls and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Competition Entries</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleRefreshEntries}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" onClick={handleExportEntries}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by trader name, email, or transaction ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={weekFilter} onValueChange={setWeekFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by week" />
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
                <SelectItem value="Confirmed">Confirmed</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Refunded">Refunded</SelectItem>
                <SelectItem value="Failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Entries Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Participant</TableHead>
                <TableHead>Competition</TableHead>
                <TableHead>Entry Date</TableHead>
                <TableHead className="text-right">Entry Fee</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Transaction ID</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.map((entry) => {
                const user = getUserByEntry(entry);
                const competition = getCompetitionByEntry(entry);
                
                return (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{entry.traderName}</div>
                        <div className="text-sm text-muted-foreground">{user?.email}</div>
                        <div className="text-xs text-muted-foreground">{user?.fullName}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">Week {competition?.weekNumber}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(competition?.startDate || '').toLocaleDateString()} - {new Date(competition?.endDate || '').toLocaleDateString()}
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
                      ${entry.entryFee}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{entry.paymentMethod}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(entry.status)}
                        <Badge variant={getStatusBadgeVariant(entry.status)}>
                          {entry.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{entry.transactionId}</TableCell>
                    <TableCell className="text-right">
                      {entry.status === 'Confirmed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRefundEntry(entry.id)}
                        >
                          Refund
                        </Button>
                      )}
                      {entry.status === 'Pending' && (
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline">Approve</Button>
                          <Button size="sm" variant="outline">Decline</Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {filteredEntries.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No entries found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};