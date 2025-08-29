import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Download, UserPlus, Eye, Ban, Mail, Calendar, Users, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";
import { mockUsers, mockTraderAccounts, type User } from "@/lib/mockData";
import { useToast } from "@/hooks/use-toast";

export const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("registrationDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const { toast } = useToast();

  // Memoized filtering and sorting for performance
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = mockUsers.filter(user => {
      const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.fullName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || user.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    // Sort users
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof User];
      let bValue: any = b[sortBy as keyof User];
      
      if (sortBy === 'registrationDate') {
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
  }, [searchTerm, statusFilter, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedUsers.length / pageSize);
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredAndSortedUsers.slice(startIndex, startIndex + pageSize);
  }, [filteredAndSortedUsers, currentPage, pageSize]);

  const getUserAccountCount = (userId: string) => {
    return mockTraderAccounts.filter(acc => acc.userId === userId).length;
  };

  const handleSuspendUser = (userId: string) => {
    toast({
      title: "User Suspended",
      description: "User has been suspended successfully.",
    });
  };

  const handleViewUser = (userId: string) => {
    toast({
      title: "User Details",
      description: "Opening user details...",
    });
  };

  const handleExportUsers = () => {
    toast({
      title: "Export Started",
      description: "User data export is being generated...",
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Active': return 'default';
      case 'Suspended': return 'secondary';
      case 'Banned': return 'destructive';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{mockUsers.length}</div>
            <p className="text-sm text-muted-foreground">Total Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{mockUsers.filter(u => u.status === 'Active').length}</div>
            <p className="text-sm text-muted-foreground">Active Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{mockUsers.filter(u => u.affiliateCode).length}</div>
            <p className="text-sm text-muted-foreground">Affiliates</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{mockUsers.filter(u => u.referredBy).length}</div>
            <p className="text-sm text-muted-foreground">Referred Users</p>
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
                    setCurrentPage(1); // Reset to first page on search
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
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Suspended">Suspended</SelectItem>
                  <SelectItem value="Banned">Banned</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="registrationDate">Registration Date</SelectItem>
                  <SelectItem value="fullName">Name</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="age">Age</SelectItem>
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
                <Button onClick={handleExportUsers} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
                <Button>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add User
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
                <TableHead>Trader Accounts</TableHead>
                <TableHead>Affiliate Info</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{user.fullName}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                      <div className="text-xs text-muted-foreground">Age: {user.age}</div>
                    </div>
                  </TableCell>
                  <TableCell>{new Date(user.registrationDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(user.status)}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{getUserAccountCount(user.id)} accounts</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {user.affiliateCode && (
                        <div className="text-green-600">Code: {user.affiliateCode}</div>
                      )}
                      {user.referredBy && (
                        <div className="text-blue-600">Referred by: {user.referredBy}</div>
                      )}
                      {!user.affiliateCode && !user.referredBy && (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>User Details - {user.fullName}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-6">
                            {/* Personal Information */}
                            <div className="grid grid-cols-2 gap-4">
                              <Card>
                                <CardHeader className="pb-3">
                                  <CardTitle className="text-sm flex items-center gap-2">
                                    <Mail className="w-4 h-4" />
                                    Contact Information
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                                    <p className="text-sm">{user.email}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">Age</label>
                                    <p className="text-sm">{user.age} years old</p>
                                  </div>
                                </CardContent>
                              </Card>
                              
                              <Card>
                                <CardHeader className="pb-3">
                                  <CardTitle className="text-sm flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    Account Details
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                                    <div className="mt-1">
                                      <Badge variant={getStatusBadgeVariant(user.status)}>
                                        {user.status}
                                      </Badge>
                                    </div>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">Registered</label>
                                    <p className="text-sm">{new Date(user.registrationDate).toLocaleDateString()}</p>
                                  </div>
                                </CardContent>
                              </Card>
                            </div>

                            {/* Trading Information */}
                            <Card>
                              <CardHeader className="pb-3">
                                <CardTitle className="text-sm flex items-center gap-2">
                                  <TrendingUp className="w-4 h-4" />
                                  Trading Activity
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="grid grid-cols-3 gap-4">
                                  <div className="text-center">
                                    <div className="text-2xl font-bold">{getUserAccountCount(user.id)}</div>
                                    <p className="text-sm text-muted-foreground">Trader Accounts</p>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-2xl font-bold">
                                      {mockTraderAccounts.filter(acc => acc.userId === user.id && acc.accountStatus === 'Active').length}
                                    </div>
                                    <p className="text-sm text-muted-foreground">Active Accounts</p>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-2xl font-bold">
                                      {mockTraderAccounts.filter(acc => acc.userId === user.id).length > 0 ? new Date(user.registrationDate).toLocaleDateString() : '-'}
                                    </div>
                                    <p className="text-sm text-muted-foreground">Last Activity</p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>

                            {/* Affiliate Information */}
                            {(user.affiliateCode || user.referredBy) && (
                              <Card>
                                <CardHeader className="pb-3">
                                  <CardTitle className="text-sm flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    Affiliate Information
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                  {user.affiliateCode && (
                                    <div>
                                      <label className="text-sm font-medium text-muted-foreground">Affiliate Code</label>
                                      <p className="text-sm font-mono bg-muted px-2 py-1 rounded">{user.affiliateCode}</p>
                                    </div>
                                  )}
                                  {user.referredBy && (
                                    <div>
                                      <label className="text-sm font-medium text-muted-foreground">Referred By</label>
                                      <p className="text-sm">{user.referredBy}</p>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            )}

                            {/* Actions */}
                            <div className="flex gap-2 justify-end pt-4 border-t">
                              <Button variant="outline" size="sm">
                                Edit User
                              </Button>
                              <Button variant="outline" size="sm">
                                View Trading History
                              </Button>
                              {user.status === 'Active' && (
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => handleSuspendUser(user.id)}
                                >
                                  <Ban className="w-4 h-4 mr-2" />
                                  Suspend User
                                </Button>
                              )}
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSuspendUser(user.id)}
                        disabled={user.status !== 'Active'}
                      >
                        <Ban className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
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
            <div className="text-center py-8 text-muted-foreground">
              No users found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};