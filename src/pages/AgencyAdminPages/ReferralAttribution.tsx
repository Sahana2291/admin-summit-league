import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Search, Download, Filter } from "lucide-react";
import { mockReferrals, mockInfluencers } from "@/lib/affiliateData";

export const ReferralAttribution = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [codeFilter, setCodeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [countryFilter, setCountryFilter] = useState("");

  // Extended mock data for better demonstration
  const referrals = [
    ...mockReferrals,
    {
      id: 'ref-003',
      agencyId: 'ag-001',
      influencerId: 'inf-001',
      userEmail: 'trader1@example.com',
      codeUsed: 'ALPHA-ALEX',
      campaign: 'Q3 2024 Campaign',
      status: 'Registered' as const,
      fundingAmount: 0,
      qualificationFlag: false,
      country: 'Canada',
      notes: 'Recently registered',
      createdAt: new Date('2024-08-22')
    },
    {
      id: 'ref-004',
      agencyId: 'ag-001',
      influencerId: 'inf-002',
      userEmail: 'trader2@example.com',
      codeUsed: 'ALPHA-EMMA',
      campaign: 'Q3 2024 Campaign',
      status: 'Clicked' as const,
      fundingAmount: 0,
      qualificationFlag: false,
      country: 'Germany',
      notes: 'Initial click recorded',
      createdAt: new Date('2024-08-23')
    },
    {
      id: 'ref-005',
      agencyId: 'ag-001',
      influencerId: 'inf-001',
      userEmail: 'vip@example.com',
      codeUsed: 'ALPHA-ALEX',
      campaign: 'VIP Campaign',
      status: 'Qualified' as const,
      fundingAmount: 5000,
      qualificationFlag: true,
      country: 'United States',
      notes: 'High-value qualified trader',
      createdAt: new Date('2024-08-19')
    }
  ];

  const getInfluencerName = (influencerId: string) => {
    return mockInfluencers.find(inf => inf.id === influencerId)?.name || 'Unknown Influencer';
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Qualified": return "default";
      case "Funded": return "outline";
      case "Registered": return "secondary";
      case "Clicked": return "outline";
      default: return "secondary";
    }
  };

  const filteredReferrals = referrals.filter(referral => {
    const matchesSearch = referral.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         referral.codeUsed.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCode = !codeFilter || referral.codeUsed === codeFilter;
    const matchesStatus = !statusFilter || referral.status === statusFilter;
    const matchesCountry = !countryFilter || referral.country === countryFilter;
    
    return matchesSearch && matchesCode && matchesStatus && matchesCountry;
  });

  // Calculate funnel metrics
  const funnelData = {
    clicks: referrals.filter(r => r.status === 'Clicked').length + 
           referrals.filter(r => ['Registered', 'Funded', 'Qualified'].includes(r.status)).length,
    registrations: referrals.filter(r => ['Registered', 'Funded', 'Qualified'].includes(r.status)).length,
    funded: referrals.filter(r => ['Funded', 'Qualified'].includes(r.status)).length,
    qualified: referrals.filter(r => r.status === 'Qualified').length
  };

  const uniqueCodes = [...new Set(referrals.map(r => r.codeUsed))];
  const uniqueCountries = [...new Set(referrals.map(r => r.country))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Referrals & Attribution</h1>
          <p className="text-muted-foreground">Track conversion funnel and referral performance</p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Data
        </Button>
      </div>

      {/* Conversion Funnel */}
      <Card>
        <CardHeader>
          <CardTitle>Conversion Funnel</CardTitle>
          <CardDescription>Track user journey from click to qualification</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-500">{funnelData.clicks}</div>
              <div className="text-sm text-muted-foreground">Clicks</div>
              <div className="text-xs text-muted-foreground mt-1">100%</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-500">{funnelData.registrations}</div>
              <div className="text-sm text-muted-foreground">Registrations</div>
              <div className="text-xs text-muted-foreground mt-1">
                {((funnelData.registrations / funnelData.clicks) * 100).toFixed(1)}%
              </div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-500">{funnelData.funded}</div>
              <div className="text-sm text-muted-foreground">Funded</div>
              <div className="text-xs text-muted-foreground mt-1">
                {((funnelData.funded / funnelData.registrations) * 100).toFixed(1)}%
              </div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-500">{funnelData.qualified}</div>
              <div className="text-sm text-muted-foreground">Qualified</div>
              <div className="text-xs text-muted-foreground mt-1">
                {((funnelData.qualified / funnelData.funded) * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Referrals</CardTitle>
          <CardDescription>Filter referrals by various criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users, codes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={codeFilter} onValueChange={setCodeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Codes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Codes</SelectItem>
                {uniqueCodes.map((code) => (
                  <SelectItem key={code} value={code}>
                    {code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="Clicked">Clicked</SelectItem>
                <SelectItem value="Registered">Registered</SelectItem>
                <SelectItem value="Funded">Funded</SelectItem>
                <SelectItem value="Qualified">Qualified</SelectItem>
              </SelectContent>
            </Select>

            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Countries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Countries</SelectItem>
                {uniqueCountries.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => {
              setSearchTerm("");
              setCodeFilter("");
              setStatusFilter("");
              setCountryFilter("");
            }}>
              <Filter className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Referrals Table */}
      <Card>
        <CardHeader>
          <CardTitle>Referral Details</CardTitle>
          <CardDescription>Detailed view of all referral activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Influencer</TableHead>
                  <TableHead>Code Used</TableHead>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Funding</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReferrals.map((referral) => (
                  <TableRow key={referral.id}>
                    <TableCell className="font-mono text-sm">
                      {referral.createdAt.toLocaleDateString()}
                    </TableCell>
                    <TableCell>{referral.userEmail}</TableCell>
                    <TableCell>{getInfluencerName(referral.influencerId)}</TableCell>
                    <TableCell>
                      <code className="text-sm bg-muted px-2 py-1 rounded">
                        {referral.codeUsed}
                      </code>
                    </TableCell>
                    <TableCell>{referral.campaign}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(referral.status)}>
                        {referral.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {referral.fundingAmount ? `$${referral.fundingAmount.toLocaleString()}` : '-'}
                    </TableCell>
                    <TableCell>{referral.country}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-32 truncate">
                      {referral.notes}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredReferrals.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No referrals found matching your filters.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance by Influencer */}
      <Card>
        <CardHeader>
          <CardTitle>Performance by Influencer</CardTitle>
          <CardDescription>Compare conversion rates across your influencers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockInfluencers.map((influencer) => {
              const influencerReferrals = referrals.filter(r => r.influencerId === influencer.id);
              const clicks = influencerReferrals.length;
              const qualified = influencerReferrals.filter(r => r.status === 'Qualified').length;
              const conversionRate = clicks > 0 ? (qualified / clicks) * 100 : 0;
              
              return (
                <div key={influencer.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">{influencer.name}</div>
                    <div className="text-sm text-muted-foreground">{influencer.referralCode}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm">
                      {clicks} referrals → {qualified} qualified
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {conversionRate.toFixed(1)}% conversion
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};