import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, TrendingUp, TrendingDown, Users, DollarSign, Trophy, Calendar } from "lucide-react";
import { mockCompetitions, mockUsers, mockTraderAccounts, mockTransactions } from "@/lib/mockData";
import { useToast } from "@/hooks/use-toast";

export const ReportsAnalytics = () => {
  const { toast } = useToast();

  // Calculate analytics
  const totalUsers = mockUsers.length;
  const totalAccounts = mockTraderAccounts.length;
  const totalCompetitions = mockCompetitions.length;
  const totalRevenue = mockCompetitions.reduce((sum, comp) => sum + comp.adminFeeAmount, 0);
  const totalPrizePool = mockCompetitions.reduce((sum, comp) => sum + comp.totalPrizePool, 0);
  const totalParticipants = mockCompetitions.reduce((sum, comp) => sum + comp.totalParticipants, 0);
  const avgParticipantsPerWeek = totalParticipants / totalCompetitions;
  const avgAccountsPerUser = totalAccounts / totalUsers;

  // Growth metrics (mock data for demonstration)
  const weeklyGrowthRate = 15.2; // percentage
  const monthlyRevenue = totalRevenue * 0.7; // approximation
  const retentionRate = 78.5; // percentage

  // Competition performance
  const competitionMetrics = mockCompetitions.map(comp => ({
    ...comp,
    revenue: comp.adminFeeAmount,
    participantGrowth: Math.random() * 20 - 10, // mock growth rate
    avgEntryValue: comp.totalPrizePool / comp.totalParticipants * 2 // entry fee approximation
  }));

  const handleExportReport = (reportType: string) => {
    toast({
      title: "Report Export",
      description: `${reportType} report is being generated and will be downloaded shortly.`,
    });
  };

  const handleScheduleReport = () => {
    toast({
      title: "Report Scheduled",
      description: "Weekly automated report has been scheduled.",
    });
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? (
      <TrendingUp className="w-4 h-4 text-green-600" />
    ) : (
      <TrendingDown className="w-4 h-4 text-red-600" />
    );
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? "text-green-600" : "text-red-600";
  };

  return (
    <div className="space-y-6">
      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{totalUsers.toLocaleString()}</div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <div className="flex items-center gap-1 mt-1">
                  {getGrowthIcon(weeklyGrowthRate)}
                  <span className={`text-xs ${getGrowthColor(weeklyGrowthRate)}`}>
                    +{weeklyGrowthRate}% this week
                  </span>
                </div>
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
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-xs text-green-600">
                    ${monthlyRevenue.toLocaleString()} this month
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold">{totalParticipants.toLocaleString()}</div>
                <p className="text-sm text-muted-foreground">Total Participants</p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs text-muted-foreground">
                    Avg {avgParticipantsPerWeek.toFixed(0)}/week
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">{retentionRate}%</div>
                <p className="text-sm text-muted-foreground">User Retention</p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs text-muted-foreground">
                    {avgAccountsPerUser.toFixed(1)} accounts/user
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Breakdown */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Revenue Analytics</CardTitle>
            <Button variant="outline" onClick={() => handleExportReport("Revenue Analytics")}>
              <Download className="w-4 h-4 mr-2" />
              Export Revenue Report
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold">Revenue Sources</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Entry Fees (50% Admin)</span>
                  <span className="font-mono">${totalRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Prize Pool Distribution</span>
                  <span className="font-mono">${totalPrizePool.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center font-semibold border-t pt-2">
                  <span>Total Platform Volume</span>
                  <span className="font-mono">${(totalRevenue + totalPrizePool).toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Monthly Breakdown</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">December 2024</span>
                  <span className="font-mono">${monthlyRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">November 2024</span>
                  <span className="font-mono">${(monthlyRevenue * 0.85).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">October 2024</span>
                  <span className="font-mono">${(monthlyRevenue * 0.72).toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Performance Metrics</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Avg Revenue/User</span>
                  <span className="font-mono">${(totalRevenue / totalUsers).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Avg Revenue/Competition</span>
                  <span className="font-mono">${(totalRevenue / totalCompetitions).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Growth Rate</span>
                  <span className="font-mono text-green-600">+{weeklyGrowthRate}%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Competition Performance */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Competition Performance</CardTitle>
            <Button variant="outline" onClick={() => handleExportReport("Competition Performance")}>
              <Download className="w-4 h-4 mr-2" />
              Export Competition Report
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Week</th>
                  <th className="text-right py-2">Participants</th>
                  <th className="text-right py-2">Entry Fee</th>
                  <th className="text-right py-2">Total Volume</th>
                  <th className="text-right py-2">Company Revenue</th>
                  <th className="text-right py-2">Prize Pool</th>
                  <th className="text-center py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {competitionMetrics.map((comp) => (
                  <tr key={comp.id} className="border-b">
                    <td className="py-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        Week {comp.weekNumber}
                      </div>
                    </td>
                    <td className="text-right py-2 font-mono">{comp.totalParticipants.toLocaleString()}</td>
                    <td className="text-right py-2 font-mono">${comp.entryFee}</td>
                    <td className="text-right py-2 font-mono">${(comp.totalPrizePool * 2).toLocaleString()}</td>
                    <td className="text-right py-2 font-mono font-semibold">${comp.revenue.toLocaleString()}</td>
                    <td className="text-right py-2 font-mono">${comp.totalPrizePool.toLocaleString()}</td>
                    <td className="text-center py-2">
                      <Badge variant={comp.status === 'Active' ? 'default' : 'secondary'}>
                        {comp.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* User Analytics */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>User Analytics</CardTitle>
            <Button variant="outline" onClick={() => handleExportReport("User Analytics")}>
              <Download className="w-4 h-4 mr-2" />
              Export User Report
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold">User Statistics</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Registered Users</span>
                  <span className="font-mono text-lg">{totalUsers}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Active Users (this month)</span>
                  <span className="font-mono text-lg">{Math.floor(totalUsers * 0.75)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Users with Multiple Accounts</span>
                  <span className="font-mono text-lg">2</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Average Account Age</span>
                  <span className="font-mono text-lg">45 days</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Engagement Metrics</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Participation Rate</span>
                  <span className="font-mono text-lg">{((totalParticipants / totalUsers / totalCompetitions) * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">User Retention Rate</span>
                  <span className="font-mono text-lg">{retentionRate}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Avg Competitions/User</span>
                  <span className="font-mono text-lg">{(totalParticipants / totalUsers).toFixed(1)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Avg Accounts/User</span>
                  <span className="font-mono text-lg">{avgAccountsPerUser.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Automated Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Automated Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Set up automated reports to be delivered to your email on a schedule.
            </p>
            <div className="flex gap-2">
              <Button onClick={handleScheduleReport}>
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Weekly Report
              </Button>
              <Button variant="outline" onClick={() => handleExportReport("Full Analytics")}>
                <Download className="w-4 h-4 mr-2" />
                Export Full Analytics
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};