import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Play, Pause, Trophy, DollarSign, Users, Calendar } from "lucide-react";
import { mockCompetitions, type Competition } from "@/lib/mockData";
import { useToast } from "@/hooks/use-toast";

export const CompetitionManagement = () => {
  const [newWeekName, setNewWeekName] = useState("");
  const [newEntryFee, setNewEntryFee] = useState("50");
  const [competitions, setCompetitions] = useState(mockCompetitions);
  const { toast } = useToast();

  const totalParticipants = competitions.reduce((sum, comp) => sum + comp.totalParticipants, 0);
  const totalPrizePool = competitions.reduce((sum, comp) => sum + comp.totalPrizePool, 0);
  const totalRevenue = competitions.reduce((sum, comp) => sum + comp.adminFeeAmount, 0);

  const handleCreateWeek = () => {
    if (!newWeekName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a week name.",
        variant: "destructive",
      });
      return;
    }

    const entryFee = parseFloat(newEntryFee);
    if (isNaN(entryFee) || entryFee <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid entry fee.",
        variant: "destructive",
      });
      return;
    }

    // Create new competition
    const newCompetition: Competition = {
      id: `comp_${Date.now()}`,
      weekNumber: competitions.length + 1,
      status: 'Scheduled',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      entryFee: entryFee,
      totalParticipants: 0,
      totalPrizePool: 0,
      adminFeePercentage: 15,
      adminFeeAmount: 0,
      weekName: newWeekName.trim()
    };

    setCompetitions(prev => [newCompetition, ...prev]);

    toast({
      title: "Week Created",
      description: `${newWeekName} has been created successfully.`,
    });
    
    setNewWeekName("");
    setNewEntryFee("50");
  };

  const handleToggleWeek = (weekId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Active' ? 'Completed' : currentStatus === 'Scheduled' ? 'Active' : 'Scheduled';
    
    setCompetitions(prev => 
      prev.map(comp => 
        comp.id === weekId 
          ? { ...comp, status: newStatus as Competition['status'] }
          : comp
      )
    );

    toast({
      title: "Week Status Updated",
      description: `Week status changed to ${newStatus}.`,
    });
  };

  const handlePublishResults = (weekId: string) => {
    toast({
      title: "Results Published",
      description: "Competition results have been published.",
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Active': return 'default';
      case 'Completed': return 'secondary';
      case 'Scheduled': return 'outline';
      default: return 'default';
    }
  };

  const calculatePrizeDistribution = (totalPrizePool: number) => {
    // Based on your prize structure
    const distributions = {
      first: Math.min(totalPrizePool * 0.30, 4000),
      second: Math.min(totalPrizePool * 0.25, 3000),
      third: Math.min(totalPrizePool * 0.20, 2000),
      fourth: Math.min(totalPrizePool * 0.15, 1500),
      fifth: Math.min(totalPrizePool * 0.10, 1000),
    };

    const topFiveTotal = Object.values(distributions).reduce((sum, val) => sum + val, 0);
    const remaining = totalPrizePool - topFiveTotal;
    const fixedRewards = Math.min(remaining, 1000); // 6th-10th place ($200 each)
    const variableRewards = remaining - fixedRewards;

    return {
      ...distributions,
      topFiveTotal,
      remaining,
      fixedRewards,
      variableRewards,
      variableCount: Math.floor(variableRewards / 100)
    };
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold">{competitions.length}</div>
                <p className="text-sm text-muted-foreground">Total Competitions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{totalParticipants.toLocaleString()}</div>
                <p className="text-sm text-muted-foreground">Total Participants</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">${totalPrizePool.toLocaleString()}</div>
                <p className="text-sm text-muted-foreground">Total Prize Pool</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-red-600" />
              <div>
                <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
                <p className="text-sm text-muted-foreground">Company Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create New Week */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Create Week</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Week name (e.g., Week 36)"
              value={newWeekName}
              onChange={(e) => setNewWeekName(e.target.value)}
              className="flex-1"
            />
            <Input
              type="number"
              placeholder="Entry Fee"
              value={newEntryFee}
              onChange={(e) => setNewEntryFee(e.target.value)}
              className="w-32"
            />
            <Button onClick={handleCreateWeek}>
              <Plus className="w-4 h-4 mr-2" />
              Create Week
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Competitions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Competition Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Week</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date Range</TableHead>
                <TableHead className="text-right">Entry Fee</TableHead>
                <TableHead className="text-right">Participants</TableHead>
                <TableHead className="text-right">Prize Pool</TableHead>
                <TableHead className="text-right">Company Share</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {competitions.map((competition) => (
                <TableRow key={competition.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{competition.weekName || `Week ${competition.weekNumber}`}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(competition.status)}>
                      {competition.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{new Date(competition.startDate).toLocaleDateString()}</div>
                      <div className="text-muted-foreground">to {new Date(competition.endDate).toLocaleDateString()}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono">${competition.entryFee}</TableCell>
                  <TableCell className="text-right font-mono">{competition.totalParticipants.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono">${competition.totalPrizePool.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono">${competition.adminFeeAmount.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleWeek(competition.id, competition.status)}
                      >
                        {competition.status === 'Active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePublishResults(competition.id)}
                        disabled={competition.status !== 'Completed'}
                      >
                        Publish
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Prize Distribution Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Prize Distribution Structure</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Example for {competitions[0]?.weekName || `Week ${competitions[0]?.weekNumber}`} (Prize Pool: ${competitions[0]?.totalPrizePool.toLocaleString()})
            </div>
            {competitions[0] && (() => {
              const dist = calculatePrizeDistribution(competitions[0].totalPrizePool);
              return (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-lg font-bold text-yellow-600">${dist.first.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">1st Place</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-lg font-bold text-gray-400">${dist.second.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">2nd Place</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-lg font-bold text-orange-600">${dist.third.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">3rd Place</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-lg font-bold">${dist.fourth.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">4th Place</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-lg font-bold">${dist.fifth.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">5th Place</div>
                  </div>
                </div>
              );
            })()}
            <div className="text-sm text-muted-foreground">
              6th-10th Place: $200 each • 11th+ Place: $100 each ({calculatePrizeDistribution(competitions[0]?.totalPrizePool || 0).variableCount} additional winners)
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};