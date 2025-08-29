import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy, Medal, Award, Download, RefreshCw, TrendingUp, Users } from "lucide-react";
import { mockCompetitions } from "@/lib/mockData";
import { useToast } from "@/hooks/use-toast";

// Mock leaderboard data
const mockLeaderboards = [
  {
    weekId: "comp35",
    weekNumber: 35,
    status: "Active",
    lastUpdated: "2024-12-20T15:30:00Z",
    totalParticipants: 1247,
    leaderboard: [
      { rank: 1, traderName: "AlphaWolf", email: "alpha@trader.com", profitPercent: 23.45, balance: 12345, roi: 23.45 },
      { rank: 2, traderName: "TraderPro_88", email: "pro@trader.com", profitPercent: 19.82, balance: 11982, roi: 19.82 },
      { rank: 3, traderName: "MarketMaster", email: "mark@trader.com", profitPercent: 18.67, balance: 11867, roi: 18.67 },
      { rank: 4, traderName: "CryptoKing", email: "crypto@trader.com", profitPercent: 17.23, balance: 11723, roi: 17.23 },
      { rank: 5, traderName: "ForexGuru", email: "forex@trader.com", profitPercent: 16.89, balance: 11689, roi: 16.89 },
    ]
  },
  {
    weekId: "comp34",
    weekNumber: 34,
    status: "Completed",
    lastUpdated: "2024-12-15T23:59:00Z",
    totalParticipants: 1012,
    leaderboard: [
      { rank: 1, traderName: "TraderPro_88", email: "pro@trader.com", profitPercent: 28.92, balance: 12892, roi: 28.92 },
      { rank: 2, traderName: "AlphaWolf", email: "alpha@trader.com", profitPercent: 25.67, balance: 12567, roi: 25.67 },
      { rank: 3, traderName: "SwingMaster", email: "swing@trader.com", profitPercent: 22.34, balance: 12234, roi: 22.34 },
      { rank: 4, traderName: "DayTrader99", email: "day@trader.com", profitPercent: 21.45, balance: 12145, roi: 21.45 },
      { rank: 5, traderName: "ScalpingPro", email: "scalp@trader.com", profitPercent: 20.88, balance: 12088, roi: 20.88 },
    ]
  }
];

export const LeaderboardManagement = () => {
  const { toast } = useToast();

  const handleSnapshotCapture = (weekId: string) => {
    toast({
      title: "Snapshot Captured",
      description: `Leaderboard snapshot for week ${weekId} has been captured successfully.`,
    });
  };

  const handlePublishResults = (weekId: string) => {
    toast({
      title: "Results Published",
      description: `Week ${weekId} results have been published to participants.`,
    });
  };

  const handleExportLeaderboard = (weekId: string) => {
    toast({
      title: "Export Started",
      description: `Leaderboard data for week ${weekId} is being exported...`,
    });
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2: return <Medal className="w-5 h-5 text-gray-400" />;
      case 3: return <Award className="w-5 h-5 text-orange-600" />;
      default: return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold">{rank}</span>;
    }
  };

  const getRankBadgeVariant = (rank: number) => {
    if (rank === 1) return "default";
    if (rank <= 3) return "secondary";
    if (rank <= 10) return "outline";
    return "outline";
  };

  const calculatePrizeAmount = (rank: number, totalPrizePool: number) => {
    // Based on your prize structure
    const prizeStructure = {
      1: Math.min(totalPrizePool * 0.30, 4000),
      2: Math.min(totalPrizePool * 0.25, 3000),
      3: Math.min(totalPrizePool * 0.20, 2000),
      4: Math.min(totalPrizePool * 0.15, 1500),
      5: Math.min(totalPrizePool * 0.10, 1000),
    };

    if (rank <= 5) {
      return prizeStructure[rank as keyof typeof prizeStructure] || 0;
    } else if (rank <= 10) {
      return 200; // Fixed $200 for ranks 6-10
    } else {
      return 100; // $100 for rank 11+
    }
  };

  const activeLeaderboards = mockLeaderboards.filter(lb => lb.status === 'Active');
  const completedLeaderboards = mockLeaderboards.filter(lb => lb.status === 'Completed');

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold">{activeLeaderboards.length}</div>
                <p className="text-sm text-muted-foreground">Active Competitions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">
                  {activeLeaderboards.reduce((sum, lb) => sum + lb.totalParticipants, 0).toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground">Active Participants</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">
                  {activeLeaderboards[0]?.leaderboard[0]?.profitPercent.toFixed(1)}%
                </div>
                <p className="text-sm text-muted-foreground">Top Performer ROI</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">{completedLeaderboards.length}</div>
                <p className="text-sm text-muted-foreground">Completed Weeks</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Leaderboards */}
      {activeLeaderboards.map((leaderboard) => {
        const competition = mockCompetitions.find(c => c.id === leaderboard.weekId);
        return (
          <Card key={leaderboard.weekId}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-600" />
                    Week {leaderboard.weekNumber} Leaderboard
                    <Badge variant="default" className="ml-2">LIVE</Badge>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {leaderboard.totalParticipants.toLocaleString()} participants • 
                    Last updated: {new Date(leaderboard.lastUpdated).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => handleSnapshotCapture(leaderboard.weekId)}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Capture Snapshot
                  </Button>
                  <Button variant="outline" onClick={() => handleExportLeaderboard(leaderboard.weekId)}>
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button onClick={() => handlePublishResults(leaderboard.weekId)}>
                    Publish Results
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Rank</TableHead>
                    <TableHead>Trader</TableHead>
                    <TableHead className="text-right">P&L %</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead className="text-right">ROI</TableHead>
                    <TableHead className="text-right">Prize Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaderboard.leaderboard.map((trader) => (
                    <TableRow key={`${leaderboard.weekId}-${trader.rank}`}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getRankIcon(trader.rank)}
                          <Badge variant={getRankBadgeVariant(trader.rank)}>
                            #{trader.rank}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{trader.traderName}</div>
                          <div className="text-sm text-muted-foreground">{trader.email}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className={`font-mono font-bold ${trader.profitPercent > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {trader.profitPercent > 0 ? '+' : ''}{trader.profitPercent.toFixed(2)}%
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        ${trader.balance.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className={`font-mono ${trader.roi > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {trader.roi > 0 ? '+' : ''}{trader.roi.toFixed(2)}%
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="font-mono font-bold text-green-600">
                          ${calculatePrizeAmount(trader.rank, competition?.totalPrizePool || 50000).toLocaleString()}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );
      })}

      {/* Completed Leaderboards */}
      <Card>
        <CardHeader>
          <CardTitle>Previous Competitions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {completedLeaderboards.map((leaderboard) => (
              <div key={leaderboard.weekId} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">Week {leaderboard.weekNumber}</div>
                  <div className="text-sm text-muted-foreground">
                    {leaderboard.totalParticipants.toLocaleString()} participants • 
                    Winner: {leaderboard.leaderboard[0].traderName} ({leaderboard.leaderboard[0].profitPercent.toFixed(2)}%)
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary">Completed</Badge>
                  <Button variant="outline" size="sm" onClick={() => handleExportLeaderboard(leaderboard.weekId)}>
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};