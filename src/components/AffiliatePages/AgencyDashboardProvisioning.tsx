import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Eye, Settings, Shield, Mail } from "lucide-react";
import { mockAgencies } from "@/lib/affiliateData";

interface AgencyAdmin {
  id: string;
  agencyId: string;
  email: string;
  name: string;
  status: 'Pending' | 'Active' | 'Suspended';
  lastLogin: Date;
  permissions: string[];
}

export const AgencyDashboardProvisioning = () => {
  const { toast } = useToast();
  const [selectedAgency, setSelectedAgency] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminName, setAdminName] = useState("");
  const [readOnlyAccess, setReadOnlyAccess] = useState(false);

  const [agencyAdmins] = useState<AgencyAdmin[]>([
    {
      id: 'admin-001',
      agencyId: 'ag-001',
      email: 'admin@alphatrading.com',
      name: 'John Smith',
      status: 'Active',
      lastLogin: new Date('2024-08-25T09:30:00'),
      permissions: ['manage_influencers', 'view_reports', 'generate_codes']
    },
    {
      id: 'admin-002',
      agencyId: 'ag-002',
      email: 'admin@betaforex.com',
      name: 'Sarah Johnson',
      status: 'Active',
      lastLogin: new Date('2024-08-24T14:22:00'),
      permissions: ['manage_influencers', 'view_reports', 'generate_codes']
    },
    {
      id: 'admin-003',
      agencyId: 'ag-003',
      email: 'pending@gammacapital.com',
      name: 'Michael Chen',
      status: 'Pending',
      lastLogin: new Date('2024-08-01T00:00:00'),
      permissions: []
    }
  ]);

  const getAgencyName = (agencyId: string) => {
    return mockAgencies.find(a => a.id === agencyId)?.name || 'Unknown Agency';
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Active": return "default";
      case "Pending": return "outline";
      case "Suspended": return "destructive";
      default: return "secondary";
    }
  };

  const handleInviteAdmin = () => {
    if (!selectedAgency || !adminEmail || !adminName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Admin Invited",
      description: `Invitation sent to ${adminEmail} for ${getAgencyName(selectedAgency)}`
    });

    // Reset form
    setSelectedAgency("");
    setAdminEmail("");
    setAdminName("");
    setReadOnlyAccess(false);
  };

  const handleAccessAgencyDashboard = (agencyId: string) => {
    toast({
      title: "Dashboard Access",
      description: `Accessing ${getAgencyName(agencyId)} dashboard in audit mode`
    });
  };

  const handleToggleReadOnly = (adminId: string) => {
    toast({
      title: "Access Updated",
      description: "Read-only access toggled for agency admin"
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agency Dashboard Provisioning</h1>
          <p className="text-muted-foreground">Manage agency admin access and dashboard permissions</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Invite Agency Admin</CardTitle>
            <CardDescription>Grant admin access to agency dashboard</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="agency">Select Agency</Label>
              <Select value={selectedAgency} onValueChange={setSelectedAgency}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an agency" />
                </SelectTrigger>
                <SelectContent>
                  {mockAgencies.map((agency) => (
                    <SelectItem key={agency.id} value={agency.id}>
                      {agency.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminName">Admin Name</Label>
              <Input
                id="adminName"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                placeholder="Enter admin name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminEmail">Admin Email</Label>
              <Input
                id="adminEmail"
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="admin@agency.com"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="readOnly"
                checked={readOnlyAccess}
                onCheckedChange={setReadOnlyAccess}
              />
              <Label htmlFor="readOnly">Read-only access</Label>
            </div>

            <Button onClick={handleInviteAdmin} className="w-full">
              <UserPlus className="w-4 h-4 mr-2" />
              Send Invitation
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Agency Dashboard Features</CardTitle>
            <CardDescription>What agency admins can access in their portal</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">Create and manage influencers</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">Assign commission rules within limits</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">Generate influencer codes and links</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">View performance analytics</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">Track referrals and conversions</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">Access payout statements</span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">Commission Guardrails</h4>
              <p className="text-sm text-muted-foreground">
                Agency admins can adjust commissions within predefined ranges set by Super Admin. 
                They cannot set arbitrary values outside approved limits.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Agency Admins</CardTitle>
          <CardDescription>Manage existing agency admin accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agency</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agencyAdmins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell>{getAgencyName(admin.agencyId)}</TableCell>
                    <TableCell className="font-medium">{admin.name}</TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(admin.status)}>
                        {admin.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {admin.status === 'Pending' ? 'Never' : admin.lastLogin.toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleAccessAgencyDashboard(admin.agencyId)}
                          variant="outline"
                          size="sm"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleToggleReadOnly(admin.id)}
                          variant="outline"
                          size="sm"
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                        {admin.status === 'Pending' && (
                          <Button variant="outline" size="sm">
                            <Mail className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Super Admin Oversight</CardTitle>
          <CardDescription>Your access to agency dashboards for auditing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {mockAgencies.filter(a => a.status === 'Active').map((agency) => (
              <div key={agency.id} className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">{agency.name}</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  {agency.activeInfluencers} influencers • ${agency.estPayout.toLocaleString()} payout
                </p>
                <Button
                  onClick={() => handleAccessAgencyDashboard(agency.id)}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Audit Dashboard
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};