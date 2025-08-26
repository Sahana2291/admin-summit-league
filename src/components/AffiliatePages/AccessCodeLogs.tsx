import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Search, Download, Calendar } from "lucide-react";
import { mockAccessLogs, mockCodeIssueLogs } from "@/lib/affiliateData";

export const AccessCodeLogs = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [agencyFilter, setAgencyFilter] = useState("");
  const [outcomeFilter, setOutcomeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const accessLogs = [
    ...mockAccessLogs,
    {
      id: 'log-002',
      agencyId: 'ag-001',
      timestamp: new Date('2024-08-24T14:22:00'),
      email: 'another@prospect.com',
      ip: '192.168.1.2',
      country: 'Canada',
      device: 'Mobile Safari',
      result: 'Abandoned' as const
    },
    {
      id: 'log-003',
      agencyId: 'ag-002',
      timestamp: new Date('2024-08-23T09:15:00'),
      email: 'beta@company.com',
      ip: '192.168.1.3',
      country: 'United Kingdom',
      device: 'Desktop Firefox',
      result: 'Opened' as const
    }
  ];

  const codeIssueLogs = [
    ...mockCodeIssueLogs,
    {
      id: 'issue-002',
      agencyId: 'ag-002',
      timestamp: new Date('2024-08-24T11:20:00'),
      email: 'beta@company.com',
      issuedCode: 'BETA456',
      status: 'Issued' as const,
      notes: 'Pending email verification'
    },
    {
      id: 'issue-003',
      agencyId: 'ag-001',
      timestamp: new Date('2024-08-22T16:45:00'),
      email: 'revoked@test.com',
      issuedCode: 'ALPHA789',
      status: 'Revoked' as const,
      notes: 'Failed KYC verification'
    }
  ];

  const agencies = [
    { id: 'ag-001', name: 'Alpha Trading Partners' },
    { id: 'ag-002', name: 'Beta Forex Network' },
    { id: 'ag-003', name: 'Gamma Capital Affiliates' }
  ];

  const getAgencyName = (agencyId: string) => {
    return agencies.find(a => a.id === agencyId)?.name || 'Unknown Agency';
  };

  const getResultBadgeVariant = (result: string) => {
    switch (result) {
      case "Registered": return "default";
      case "Opened": return "outline";
      case "Abandoned": return "destructive";
      default: return "secondary";
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Claimed": return "default";
      case "Issued": return "outline";
      case "Revoked": return "destructive";
      default: return "secondary";
    }
  };

  const filteredAccessLogs = accessLogs.filter(log => {
    const matchesSearch = log.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.country.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAgency = !agencyFilter || log.agencyId === agencyFilter;
    const matchesOutcome = !outcomeFilter || log.result === outcomeFilter;
    
    return matchesSearch && matchesAgency && matchesOutcome;
  });

  const filteredCodeLogs = codeIssueLogs.filter(log => {
    const matchesSearch = log.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.issuedCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAgency = !agencyFilter || log.agencyId === agencyFilter;
    const matchesStatus = !statusFilter || log.status === statusFilter;
    
    return matchesSearch && matchesAgency && matchesStatus;
  });

  const exportLogs = (type: string) => {
    toast({
      title: "Export Started",
      description: `${type} logs are being exported to CSV`
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Access & Code Logs</h1>
          <p className="text-muted-foreground">Track invite link access and referral code issuance</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => exportLogs("Access")} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Access Logs
          </Button>
          <Button onClick={() => exportLogs("Code")} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Code Logs
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter Options</CardTitle>
          <CardDescription>Filter logs by various criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search emails, countries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={agencyFilter} onValueChange={setAgencyFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Agencies" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Agencies</SelectItem>
                {agencies.map((agency) => (
                  <SelectItem key={agency.id} value={agency.id}>
                    {agency.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={outcomeFilter} onValueChange={setOutcomeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Outcomes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Outcomes</SelectItem>
                <SelectItem value="Opened">Opened</SelectItem>
                <SelectItem value="Registered">Registered</SelectItem>
                <SelectItem value="Abandoned">Abandoned</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Last 30 days</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="access" className="space-y-4">
        <TabsList>
          <TabsTrigger value="access">Access Logs</TabsTrigger>
          <TabsTrigger value="codes">Code Issue Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="access">
          <Card>
            <CardHeader>
              <CardTitle>Access Log</CardTitle>
              <CardDescription>Track who opened invite URLs and their outcomes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Agency</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>IP / Country</TableHead>
                      <TableHead>Device</TableHead>
                      <TableHead>Result</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAccessLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-sm">
                          {log.timestamp.toLocaleString()}
                        </TableCell>
                        <TableCell>{getAgencyName(log.agencyId)}</TableCell>
                        <TableCell>{log.email || 'Not provided'}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-mono">{log.ip}</div>
                            <div className="text-muted-foreground">{log.country}</div>
                          </div>
                        </TableCell>
                        <TableCell>{log.device}</TableCell>
                        <TableCell>
                          <Badge variant={getResultBadgeVariant(log.result)}>
                            {log.result}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {filteredAccessLogs.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No access logs found matching your filters.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="codes">
          <Card>
            <CardHeader>
              <CardTitle>Code Issue Log</CardTitle>
              <CardDescription>Track referral code issuance and status changes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    <SelectItem value="Issued">Issued</SelectItem>
                    <SelectItem value="Claimed">Claimed</SelectItem>
                    <SelectItem value="Revoked">Revoked</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Agency</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Issued Code</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCodeLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-sm">
                          {log.timestamp.toLocaleString()}
                        </TableCell>
                        <TableCell>{getAgencyName(log.agencyId)}</TableCell>
                        <TableCell>{log.email}</TableCell>
                        <TableCell className="font-mono font-medium">
                          {log.issuedCode}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(log.status)}>
                            {log.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {log.notes}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {filteredCodeLogs.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No code logs found matching your filters.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};