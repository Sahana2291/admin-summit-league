// src/components/AdminDashboard.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  UserCheck,
  Activity,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Trophy,
  Target,
  BarChart3,
  PieChart
} from "lucide-react";

// Mock data - replace with real API calls
const dashboardStats = {
  totalUsers: 1250,
  totalUsersGrowth: 12.5,
  leagueParticipants: 845,
  participantsGrowth: 8.3,
  totalTradingAccounts: 2180,
  accountsGrowth: 15.7,
  totalRevenue: 187500,
  revenueGrowth: 23.2,
  activePrizePool: 95000,
  weeklyDistribution: 47500,
  avgAccountsPerUser: 1.74,
  avgProfitLoss: 1250.75
};

const recentActivities = [
  { type: "registration", user: "john.doe@email.com", timestamp: "2 minutes ago" },
  { type: "league_join", user: "sarah.chen@email.com", timestamp: "5 minutes ago" },
  { type: "account_link", user: "mike.wilson@email.com", timestamp: "8 minutes ago" },
  { type: "prize_claim", user: "emma.taylor@email.com", amount: "$2,500", timestamp: "12 minutes ago" }
];

export function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">Leadership League Management Overview</p>
        </div>
        <Badge variant="secondary" className="px-4 py-2">
          <Activity className="w-4 h-4 mr-2" />
          Live Updates
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-primary text-primary-foreground shadow-glow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Total Registered Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">{dashboardStats.totalUsers.toLocaleString()}</div>
                <div className="flex items-center gap-1 text-sm opacity-80">
                  <TrendingUp className="w-4 h-4" />
                  +{dashboardStats.totalUsersGrowth}% this month
                </div>
              </div>
              <Users className="w-8 h-8 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-primary text-primary-foreground shadow-glow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">League Participants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">{dashboardStats.leagueParticipants.toLocaleString()}</div>
                <div className="flex items-center gap-1 text-sm opacity-80">
                  <TrendingUp className="w-4 h-4" />
                  +{dashboardStats.participantsGrowth}% this month
                </div>
              </div>
              <UserCheck className="w-8 h-8 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-primary text-primary-foreground shadow-glow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Total Trading Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">{dashboardStats.totalTradingAccounts.toLocaleString()}</div>
                <div className="flex items-center gap-1 text-sm opacity-80">
                  <TrendingUp className="w-4 h-4" />
                  +{dashboardStats.accountsGrowth}% this month
                </div>
              </div>
              <Activity className="w-8 h-8 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-primary text-primary-foreground shadow-glow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">${dashboardStats.totalRevenue.toLocaleString()}</div>
                <div className="flex items-center gap-1 text-sm opacity-80">
                  <TrendingUp className="w-4 h-4" />
                  +{dashboardStats.revenueGrowth}% this month
                </div>
              </div>
              <DollarSign className="w-8 h-8 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-accent" />
              Active Prize Pool
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">${dashboardStats.activePrizePool.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground">Ready for distribution</p>
            <div className="mt-3">
              <div className="flex justify-between text-sm mb-1">
                <span>Weekly Distribution</span>
                <span>${dashboardStats.weeklyDistribution.toLocaleString()}</span>
              </div>
              <Progress value={50} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Avg Accounts per User
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{dashboardStats.avgAccountsPerUser}</div>
            <p className="text-sm text-muted-foreground">Trading accounts linked</p>
            <div className="mt-3 text-xs text-muted-foreground">
              Total: {dashboardStats.totalTradingAccounts} accounts across {dashboardStats.leagueParticipants} users
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-accent text-accent-foreground shadow-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 opacity-80" />
              Avg P&L Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${dashboardStats.avgProfitLoss.toLocaleString()}</div>
            <p className="text-sm opacity-70">Per participant this month</p>
            <div className="flex items-center gap-1 mt-2 text-sm">
              <TrendingUp className="w-4 h-4 opacity-80" />
              <span className="opacity-80">+18.5% from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="w-5 h-5 text-primary" />
            Recent Platform Activity
          </CardTitle>
          <CardDescription>Real-time updates from the Leadership League</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-card-elevated/50">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${activity.type === "registration" ? "bg-primary" :
                    activity.type === "league_join" ? "bg-secondary" :
                      activity.type === "account_link" ? "bg-accent" : "bg-warning"
                    }`} />
                  <div>
                    <p className="font-medium text-foreground">
                      {activity.type === "registration" && "New user registered"}
                      {activity.type === "league_join" && "User joined league"}
                      {activity.type === "account_link" && "Trading account linked"}
                      {activity.type === "prize_claim" && "Prize claimed"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {activity.user} {activity.amount && `• ${activity.amount}`}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}