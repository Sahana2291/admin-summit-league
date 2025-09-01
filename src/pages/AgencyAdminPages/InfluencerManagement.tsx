import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, MoreHorizontal, Edit, Link, Pause, Play, Ban, Copy } from "lucide-react";
import { mockInfluencers } from "@/lib/affiliateData";

export const InfluencerManagement = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [influencers, setInfluencers] = useState(mockInfluencers);
  
  const [newInfluencer, setNewInfluencer] = useState({
    name: "",
    handle: "",
    region: "",
    contactEmail: "",
    profileNote: "",
    commissionModel: "",
    commissionRate: ""
  });

  const filteredInfluencers = influencers.filter(inf =>
    inf.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inf.handle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inf.contactEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateInfluencer = () => {
    if (!newInfluencer.name || !newInfluencer.contactEmail) {
      toast({
        title: "Missing Information",
        description: "Please fill in required fields",
        variant: "destructive"
      });
      return;
    }

    const referralCode = `AG-${newInfluencer.name.toUpperCase().slice(0, 4)}${Math.floor(Math.random() * 100)}`;
    
    const influencer = {
      id: `inf-${Date.now()}`,
      agencyId: 'ag-001',
      ...newInfluencer,
      commissionModel: newInfluencer.commissionModel as 'CPA' | 'RevShare' | 'Hybrid',
      commissionRate: parseFloat(newInfluencer.commissionRate),
      status: 'Active' as const,
      referralCode,
      clicks: 0,
      signups: 0,
      funded: 0,
      qualified: 0,
      conversionRate: 0,
      estPayout: 0,
      createdAt: new Date()
    };

    setInfluencers(prev => [influencer, ...prev]);
    setIsDialogOpen(false);
    setNewInfluencer({
      name: "",
      handle: "",
      region: "",
      contactEmail: "",
      profileNote: "",
      commissionModel: "",
      commissionRate: ""
    });

    toast({
      title: "Influencer Created",
      description: `${influencer.name} has been added with code ${referralCode}`
    });
  };

  const handleGenerateLink = (influencer: any) => {
    const link = `https://app.com/ref/${influencer.referralCode}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Link Copied",
      description: `Referral link for ${influencer.name} copied to clipboard`
    });
  };

  const handleStatusChange = (influencerId: string, newStatus: string) => {
    setInfluencers(prev => prev.map(inf => 
      inf.id === influencerId ? { ...inf, status: newStatus as any } : inf
    ));
    toast({
      title: "Status Updated",
      description: `Influencer status changed to ${newStatus}`
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Active": return "default";
      case "Paused": return "outline";
      case "Blocked": return "destructive";
      default: return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Influencer Management</h1>
          <p className="text-muted-foreground">Manage your sub-affiliates and their performance</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Influencer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Influencer</DialogTitle>
              <DialogDescription>
                Add a new sub-affiliate to your agency program
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={newInfluencer.name}
                    onChange={(e) => setNewInfluencer(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Influencer name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="handle">Handle</Label>
                  <Input
                    id="handle"
                    value={newInfluencer.handle}
                    onChange={(e) => setNewInfluencer(prev => ({ ...prev, handle: e.target.value }))}
                    placeholder="@username"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="region">Region</Label>
                  <Select onValueChange={(value) => setNewInfluencer(prev => ({ ...prev, region: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="North America">North America</SelectItem>
                      <SelectItem value="Europe">Europe</SelectItem>
                      <SelectItem value="Asia Pacific">Asia Pacific</SelectItem>
                      <SelectItem value="Latin America">Latin America</SelectItem>
                      <SelectItem value="Middle East">Middle East</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Contact Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newInfluencer.contactEmail}
                    onChange={(e) => setNewInfluencer(prev => ({ ...prev, contactEmail: e.target.value }))}
                    placeholder="contact@email.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="commissionModel">Commission Model</Label>
                  <Select onValueChange={(value) => setNewInfluencer(prev => ({ ...prev, commissionModel: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Inherit default or custom" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RevShare">Revenue Share</SelectItem>
                      <SelectItem value="CPA">CPA</SelectItem>
                      <SelectItem value="Hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rate">Commission Rate</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="rate"
                      type="number"
                      value={newInfluencer.commissionRate}
                      onChange={(e) => setNewInfluencer(prev => ({ ...prev, commissionRate: e.target.value }))}
                      placeholder="15"
                    />
                    <span className="text-sm text-muted-foreground">
                      {newInfluencer.commissionModel === "RevShare" ? "%" : "$"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Profile Notes</Label>
                <Textarea
                  id="notes"
                  value={newInfluencer.profileNote}
                  onChange={(e) => setNewInfluencer(prev => ({ ...prev, profileNote: e.target.value }))}
                  placeholder="Additional notes about this influencer..."
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateInfluencer}>
                Create Influencer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Influencers</CardTitle>
          <CardDescription>Manage commission structures and track performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search influencers..."
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
                  <TableHead>Influencer</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Referral Code</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Est. Payout</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInfluencers.map((influencer) => (
                  <TableRow key={influencer.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{influencer.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {influencer.handle} • {influencer.contactEmail}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{influencer.region}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{influencer.commissionModel}</div>
                        <div className="text-muted-foreground">
                          {influencer.commissionModel === 'RevShare' ? `${influencer.commissionRate}%` : `$${influencer.commissionRate}`}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {influencer.referralCode}
                        </code>
                        <Button
                          onClick={() => handleGenerateLink(influencer)}
                          variant="ghost"
                          size="sm"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{influencer.clicks} clicks → {influencer.qualified} qualified</div>
                        <div className="text-muted-foreground">
                          {influencer.conversionRate.toFixed(2)}% conversion
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>${influencer.estPayout.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(influencer.status)}>
                        {influencer.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleGenerateLink(influencer)}>
                            <Link className="mr-2 h-4 w-4" />
                            Generate Link
                          </DropdownMenuItem>
                          {influencer.status === "Active" ? (
                            <DropdownMenuItem onClick={() => handleStatusChange(influencer.id, "Paused")}>
                              <Pause className="mr-2 h-4 w-4" />
                              Pause
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleStatusChange(influencer.id, "Active")}>
                              <Play className="mr-2 h-4 w-4" />
                              Activate
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={() => handleStatusChange(influencer.id, "Blocked")}
                            className="text-destructive"
                          >
                            <Ban className="mr-2 h-4 w-4" />
                            Block
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredInfluencers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No influencers found matching your search.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Commission Guidelines</CardTitle>
          <CardDescription>Rules and limits for commission adjustments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Revenue Share</h4>
                <p className="text-sm text-muted-foreground mb-2">Allowed range: 10% - 20%</p>
                <p className="text-sm">Default: 15% of net revenue from qualified traders</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">CPA (Cost Per Acquisition)</h4>
                <p className="text-sm text-muted-foreground mb-2">Allowed range: $200 - $400</p>
                <p className="text-sm">Default: $250 per qualified trader</p>
              </div>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm">
                <strong>Note:</strong> Commission rates must stay within the approved ranges set by Super Admin. 
                Contact your account manager to request changes outside these limits.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};