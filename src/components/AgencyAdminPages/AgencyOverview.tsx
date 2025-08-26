import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, Users, MousePointer, UserCheck, DollarSign, Target } from "lucide-react";
import { mockInfluencers } from "@/lib/affiliateData";

export const AgencyOverview = () => {
  const [period, setPeriod] = useState("7");

  // Mock KPI data based on period
  const getKPIs = (days: string) => {
    const multiplier = days === "7" ? 1 : days === "30" ? 4 : 12;
    return {
      clicks: 2840 * multiplier,
      signups: 156 * multiplier,
      funded: 124 * multiplier,
      qualified: 118 * multiplier,
      conversionRate: 4.15,
      estPayout: 8500 * multiplier
    };
  };

  const kpis = getKPIs(period);

  // Top performing influencers
  const topInfluencers = mockInfluencers
    .map(inf => ({
      ...inf,
      performance: (inf.qualified / inf.clicks) * 100
    }))
    .sort((a, b) => b.performance - a.performance);

  const KPICard = ({ title, value, icon: Icon, trend, description }: {
    title: string;
    value: string | number;
    icon: any;
    trend?: number;
    description: string;
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          </div>
          <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
        {trend && (
          <div className="flex items-center mt-4">
            <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
            <span className="text-xs text-green-500">+{trend}% from last period</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agency Overview</h1>
          <p className="text-muted-foreground">Performance dashboard for your affiliate program</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <KPICard
          title="Total Clicks"
          value={kpis.clicks.toLocaleString()}
          icon={MousePointer}
          trend={12}
          description="Across all campaigns"
        />
        <KPICard
          title="Signups"
          value={kpis.signups.toLocaleString()}
          icon={Users}
          trend={8}
          description="New registrations"
        />
        <KPICard
          title="Funded Accounts"
          value={kpis.funded.toLocaleString()}
          icon={DollarSign}
          trend={15}
          description="Accounts with deposits"
        />
        <KPICard
          title="Qualified Traders"
          value={kpis.qualified.toLocaleString()}
          icon={UserCheck}
          trend={18}
          description="Meeting commission criteria"
        />
        <KPICard
          title="Conversion Rate"
          value={`${kpis.conversionRate}%`}
          icon={Target}
          trend={5}
          description="Click to qualified"
        />
        <KPICard
          title="Estimated Payout"
          value={`$${kpis.estPayout.toLocaleString()}`}
          icon={TrendingUp}
          trend={22}
          description="Pending commission"
        />
      </div>

      {/* Performance Trends */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Performance Trends</CardTitle>
            <CardDescription>Daily performance over the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
              <p className="text-muted-foreground">Performance chart would be displayed here</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conversion Funnel</CardTitle>
            <CardDescription>User journey from click to qualification</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                <span className="text-sm font-medium">Clicks</span>
                <span className="text-sm">{kpis.clicks.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span className="text-sm font-medium">Signups</span>
                <div className="text-right">
                  <span className="text-sm">{kpis.signups.toLocaleString()}</span>
                  <div className="text-xs text-muted-foreground">
                    {((kpis.signups / kpis.clicks) * 100).toFixed(1)}% conversion
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/40 rounded-lg">
                <span className="text-sm font-medium">Funded</span>
                <div className="text-right">
                  <span className="text-sm">{kpis.funded.toLocaleString()}</span>
                  <div className="text-xs text-muted-foreground">
                    {((kpis.funded / kpis.signups) * 100).toFixed(1)}% of signups
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                <span className="text-sm font-medium">Qualified</span>
                <div className="text-right">
                  <span className="text-sm">{kpis.qualified.toLocaleString()}</span>
                  <div className="text-xs text-muted-foreground">
                    {((kpis.qualified / kpis.funded) * 100).toFixed(1)}% of funded
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Influencers */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Influencers</CardTitle>
          <CardDescription>Your best performing sub-affiliates this period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Influencer</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Clicks</TableHead>
                  <TableHead>Qualified</TableHead>
                  <TableHead>Conversion Rate</TableHead>
                  <TableHead>Est. Payout</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topInfluencers.map((influencer) => (
                  <TableRow key={influencer.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{influencer.name}</div>
                        <div className="text-sm text-muted-foreground">{influencer.handle}</div>
                      </div>
                    </TableCell>
                    <TableCell>{influencer.region}</TableCell>
                    <TableCell>{influencer.clicks.toLocaleString()}</TableCell>
                    <TableCell>{influencer.qualified}</TableCell>
                    <TableCell>{influencer.conversionRate.toFixed(2)}%</TableCell>
                    <TableCell>${influencer.estPayout.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={influencer.status === 'Active' ? 'default' : 'secondary'}>
                        {influencer.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};