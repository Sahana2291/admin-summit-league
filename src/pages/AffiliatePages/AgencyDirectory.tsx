import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Search, MoreHorizontal, Eye, Link, UserPlus, Ban, FileText, Copy } from "lucide-react";
import { mockAgencies } from "@/lib/affiliateData";

export const AgencyDirectory = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [agencies] = useState(mockAgencies);

  const filteredAgencies = agencies.filter(agency =>
    agency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agency.primaryContact.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Active": return "default";
      case "Pending KYC": return "outline";
      case "Suspended": return "destructive";
      default: return "secondary";
    }
  };

  const handleAction = (action: string, agencyName: string) => {
    toast({
      title: `${action} Action`,
      description: `${action} performed for ${agencyName}`
    });
  };

  const copyDirectUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "URL Copied",
      description: "Direct URL copied to clipboard"
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agency Directory</h1>
          <p className="text-muted-foreground">View and manage all affiliate agencies</p>
        </div>
        <Button onClick={() => handleAction("Export", "All Agencies")} variant="outline">
          Export Directory
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Agencies</CardTitle>
          <CardDescription>Complete overview of affiliate agencies and their performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search agencies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agency</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Default Commission</TableHead>
                  <TableHead>Active Influencers</TableHead>
                  <TableHead>Last 7d Clicks</TableHead>
                  <TableHead>Last 7d Qualified</TableHead>
                  <TableHead>Est. Payout</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAgencies.map((agency) => (
                  <TableRow key={agency.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{agency.name}</div>
                        <div className="text-sm text-muted-foreground">{agency.primaryContact.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(agency.status)}>
                        {agency.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{agency.defaultCommissionModel}</div>
                        <div className="text-muted-foreground">
                          {agency.defaultCommissionModel === 'RevShare' ? `${agency.defaultRate}%` : `$${agency.defaultRate}`}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{agency.activeInfluencers}</TableCell>
                    <TableCell>{agency.last7dClicks.toLocaleString()}</TableCell>
                    <TableCell>{agency.last7dQualified}</TableCell>
                    <TableCell>${agency.estPayout.toLocaleString()}</TableCell>
                    <TableCell>{agency.lastActivity.toLocaleDateString()}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleAction("View Details", agency.name)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          {agency.directUrl && (
                            <DropdownMenuItem onClick={() => copyDirectUrl(agency.directUrl!)}>
                              <Copy className="mr-2 h-4 w-4" />
                              Copy Direct URL
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleAction("Generate URL", agency.name)}>
                            <Link className="mr-2 h-4 w-4" />
                            Generate/Copy Direct URL
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction("Invite Agency Admin", agency.name)}>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Invite Agency Admin
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction("View Logs", agency.name)}>
                            <FileText className="mr-2 h-4 w-4" />
                            View Logs
                          </DropdownMenuItem>
                          {agency.status === "Active" ? (
                            <DropdownMenuItem 
                              onClick={() => handleAction("Suspend", agency.name)}
                              className="text-destructive"
                            >
                              <Ban className="mr-2 h-4 w-4" />
                              Suspend
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleAction("Reactivate", agency.name)}>
                              <UserPlus className="mr-2 h-4 w-4" />
                              Reactivate
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredAgencies.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No agencies found matching your search.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};