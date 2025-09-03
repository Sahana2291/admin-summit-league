import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useMutation } from 'convex/react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuthStore } from '@/app/store/authStore';
import { useToast } from "@/hooks/use-toast";
import { api } from '../../../convex/_generated/api';
import { Id } from "../../../convex/_generated/dataModel";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Play, Pause, Trophy, DollarSign, Users, Edit, Eye, Clock, Calendar, AlertTriangle, CheckCircle, Settings } from "lucide-react";

interface CreateLeagueForm {
  name: string;
  description: string;
  maxParticipants?: number;
}

// Utility function to format date ranges
const formatDateRange = (startDate: number, endDate: number) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  return `${start.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  })} - ${end.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  })}`;
};

// Calculate Monday for specific week offset
const getMondayForWeekOffset = (weekOffset: number) => {
  const now = new Date();
  const targetMonday = new Date(now);

  const daysUntilMonday = (8 - now.getDay()) % 7;
  targetMonday.setDate(now.getDate() + daysUntilMonday + (weekOffset * 7));
  targetMonday.setHours(9, 0, 0, 0);

  const fridayEnd = new Date(targetMonday);
  fridayEnd.setDate(targetMonday.getDate() + 4);
  fridayEnd.setHours(17, 0, 0, 0);

  return { mondayStart: targetMonday, fridayEnd };
};

export const CompetitionManagement = () => {
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [viewingLeague, setViewingLeague] = useState<any>(null);
  const [statusChangeLeague, setStatusChangeLeague] = useState<any>(null);

  // Form state with week selection
  const [formData, setFormData] = useState<CreateLeagueForm>({
    name: '',
    description: '',
    maxParticipants: undefined,
  });

  const [weekOffset, setWeekOffset] = useState(1); // Default to next week

  // Loading states
  const [isCreating, setIsCreating] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  const { admin } = useAuthStore();
  const { toast } = useToast();

  // Queries
  const leagues = useQuery(api.leagues.getAllLeagues) || [];
  const dashboardStats = useQuery(api.admin.getDashboardStats);
  const currentActiveLeague = useQuery(api.league.getCurrentActiveLeague);

  // Mutations
  const createScheduledLeague = useMutation(api.leagues.createScheduledLeague);
  const updateLeagueStatus = useMutation(api.leagues.updateLeagueStatus);
  const checkAndDeactivateExpiredLeagues = useMutation(api.leagues.checkAndDeactivateExpiredLeagues);

  // Auto-check for expired leagues periodically
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     checkAndDeactivateExpiredLeagues();
  //   }, 60000); // Check every minute

  //   return () => clearInterval(interval);
  // }, [checkAndDeactivateExpiredLeagues]);

  const handleCreateLeague = async () => {
    if (!admin) return;
    setIsCreating(true);

    try {
      if (!formData.name.trim()) {
        toast({
          title: "Error",
          description: "Please enter a competition name.",
          variant: "destructive",
        });
        return;
      }

      await createScheduledLeague({
        name: formData.name.trim(),
        description: formData.description?.trim() || '',
        maxParticipants: formData.maxParticipants,
        weekOffset: weekOffset,
        adminId: admin.id as Id<"admins">
      });

      const { mondayStart } = getMondayForWeekOffset(weekOffset);
      const isCurrentWeek = weekOffset === 0;

      toast({
        title: "Competition Created",
        description: `${formData.name} has been ${isCurrentWeek ? 'activated' : 'scheduled'} for ${mondayStart.toDateString()}.`,
      });

      // Reset form
      setFormData({
        name: '',
        description: '',
        maxParticipants: undefined,
      });
      setWeekOffset(1);
      setIsCreateDialogOpen(false);

    } catch (error) {
      console.error('Error creating league:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create competition. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleStatusToggle = async () => {
    if (!admin || !statusChangeLeague) return;
    setIsTogglingStatus(true);

    try {
      const newStatus = statusChangeLeague.status === 'active' ? 'inactive' : 'active';

      await updateLeagueStatus({
        leagueId: statusChangeLeague._id,
        status: newStatus,
        adminId: admin.id as Id<"admins">
      });

      toast({
        title: "Status Updated",
        description: `Competition status changed to ${newStatus}.`,
      });

      setStatusChangeLeague(null);

    } catch (error) {
      console.error('Error updating league status:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update status.",
        variant: "destructive",
      });
    } finally {
      setIsTogglingStatus(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'inactive': return 'secondary';
      case 'scheduled': return 'outline';
      default: return 'default';
    }
  };

  const getCompetitionPhase = (league: any) => {
    const now = Date.now();

    if (league.status === 'scheduled') {
      return { phase: 'Scheduled', color: 'text-blue-600' };
    } else if (now < league.startDate) {
      return { phase: 'Starting Soon', color: 'text-yellow-600' };
    } else if (now >= league.startDate && now <= league.endDate) {
      return { phase: 'Live', color: 'text-green-600' };
    } else {
      return { phase: 'Completed', color: 'text-purple-600' };
    }
  };

  // Calculate summary stats
  const totalCompetitions = leagues.length;
  const activeCompetitions = leagues.filter(l => l.status === 'active').length;
  const scheduledCompetitions = leagues.filter(l => l.status === 'scheduled').length;
  const totalParticipants = dashboardStats?.totalParticipants || 0;
  const totalPrizePool = dashboardStats?.totalPrizePool || 0;

  // Get preview for selected week
  const { mondayStart, fridayEnd } = getMondayForWeekOffset(weekOffset);
  const isCurrentWeek = weekOffset === 0;

  if (leagues === undefined || dashboardStats === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading competitions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Weekly Competition Management</h1>
          <p className="text-muted-foreground">Monday-Friday trading competitions with automatic scheduling</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create Weekly Competition
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Weekly Competition</DialogTitle>
              <p className="text-sm text-muted-foreground">
                Monday 9 AM - Friday 5 PM UTC • $100 entry fee
              </p>
            </DialogHeader>

            <div className="space-y-4">
              {/* Week Selection */}
              <div>
                <Label htmlFor="weekOffset">Competition Week</Label>
                <select
                  id="weekOffset"
                  value={weekOffset}
                  onChange={(e) => setWeekOffset(parseInt(e.target.value))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value={0}>This Week (if available)</option>
                  <option value={1}>Next Week (Default)</option>
                  <option value={2}>Week After Next</option>
                  <option value={3}>3 Weeks From Now</option>
                  <option value={4}>4 Weeks From Now</option>
                </select>
              </div>

              {/* Competition Schedule Preview */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-blue-800 font-medium mb-2">
                  <Calendar className="w-4 h-4" />
                  Selected Week Schedule
                </div>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-black">Start:</span>
                    <span className="text-black font-medium">{mondayStart.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black">End:</span>
                    <span className="text-black font-medium">{fridayEnd.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black">Duration:</span>
                    <span className="text-black font-medium">5 days (Mon-Fri)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black">Entry Fee:</span>
                    <span className="font-medium text-green-600">$100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black">Status:</span>
                    <span className={`font-medium ${isCurrentWeek ? 'text-green-600' : 'text-blue-600'}`}>
                      {isCurrentWeek ? 'Will Activate Immediately' : 'Will Auto-Activate on Monday'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="name">Competition Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Week 37 Trading Challenge"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Competition details and rules..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="maxParticipants">Max Participants (Optional)</Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  min="1"
                  placeholder="Leave empty for unlimited"
                  value={formData.maxParticipants || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    maxParticipants: e.target.value ? parseInt(e.target.value) : undefined
                  }))}
                />
              </div>

              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateLeague}
                  disabled={isCreating}
                >
                  {isCreating ? "Creating..." : (isCurrentWeek ? "Create & Activate" : "Schedule Competition")}
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Current Active Competition Card */}
      {currentActiveLeague && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Trophy className="w-5 h-5" />
              Current Active Competition
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <div className="text-2xl font-bold text-green-800">{currentActiveLeague.name}</div>
                <p className="text-sm text-green-600">{formatDateRange(currentActiveLeague.startDate, currentActiveLeague.endDate)}</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{currentActiveLeague.totalParticipants || 0}</div>
                <p className="text-sm text-muted-foreground">Participants</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">${(currentActiveLeague.participantPool || 0).toLocaleString()}</div>
                <p className="text-sm text-muted-foreground">Prize Pool</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setViewingLeague(currentActiveLeague)}
                  className="text-black"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View Details
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-primary text-primary-foreground shadow-glow">
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 opacity-80" />
              <div>
                <div className="text-2xl font-bold">{totalCompetitions}</div>
                <p className="text-sm opacity-80">Total Competitions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Play className="w-5 h-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{activeCompetitions}</div>
                <p className="text-sm text-muted-foreground">Active</p>
                {scheduledCompetitions > 0 && (
                  <p className="text-xs text-blue-600">{scheduledCompetitions} scheduled</p>
                )}
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
      </div>

      {/* Competitions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Competition Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Competition</TableHead>
                <TableHead>Phase</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Participants</TableHead>
                <TableHead className="text-right">Prize Pool</TableHead>
                <TableHead className="text-right">Schedule</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leagues.map((league) => {
                const phase = getCompetitionPhase(league);
                return (
                  <TableRow key={league._id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{league.name}</div>
                        {league.description && (
                          <div className="text-sm text-muted-foreground line-clamp-1">{league.description}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`text-sm font-medium ${phase.color}`}>
                        {phase.phase}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(league.status)}>
                        {league.status === 'active' ? 'Active' :
                          league.status === 'scheduled' ? 'Scheduled' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {league.participantCount || 0}
                      {league.maxParticipants && (
                        <span className="text-muted-foreground"> / {league.maxParticipants}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      ${(league.calculatedPrizePool || 0).toLocaleString()}
                      <div className="text-xs text-muted-foreground">
                        ${(league.participantPool || 0).toLocaleString()} to winners
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {formatDateRange(league.startDate, league.endDate)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setViewingLeague(league)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setStatusChangeLeague(league)}
                          disabled={league.status === 'scheduled'}
                        >
                          {league.status === 'active' ?
                            <Pause className="w-4 h-4" /> :
                            <Play className="w-4 h-4" />
                          }
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {leagues.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No competitions created yet.</p>
              <p className="text-sm">Create your first weekly competition to get started!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Competition Modal */}
      <Dialog open={!!viewingLeague} onOpenChange={() => setViewingLeague(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Competition Details: {viewingLeague?.name}
            </DialogTitle>
          </DialogHeader>
          {viewingLeague && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Competition Info</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Name:</span>
                      <p className="font-medium">{viewingLeague.name}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Status:</span>
                      <div className="mt-1">
                        <Badge variant={getStatusBadgeVariant(viewingLeague.status)}>
                          {viewingLeague.status === 'active' ? 'Active' :
                            viewingLeague.status === 'scheduled' ? 'Scheduled' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Schedule:</span>
                      <p className="text-sm">{formatDateRange(viewingLeague.startDate, viewingLeague.endDate)}</p>
                    </div>
                    {viewingLeague.description && (
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Description:</span>
                        <p className="text-sm">{viewingLeague.description}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Financial Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Entry Fee:</span>
                      <p className="text-2xl font-bold text-primary">$100</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Total Pool:</span>
                      <p className="text-xl font-bold">${(viewingLeague.calculatedPrizePool || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Admin Share (50%):</span>
                      <p className="text-lg font-semibold">${(viewingLeague.adminShare || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Prize Pool:</span>
                      <p className="text-xl font-bold text-green-600">${(viewingLeague.participantPool || 0).toLocaleString()}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Participant Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Participant Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {viewingLeague.participantCount || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Participants</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {viewingLeague.totalWinners || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Prize Winners</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {viewingLeague.maxParticipants || '∞'}
                      </div>
                      <div className="text-sm text-muted-foreground">Max Participants</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {viewingLeague.maxParticipants ?
                          Math.max(0, viewingLeague.maxParticipants - (viewingLeague.participantCount || 0)) :
                          '∞'
                        }
                      </div>
                      <div className="text-sm text-muted-foreground">Spots Remaining</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Prize Distribution */}
              {viewingLeague.prizeDistribution && viewingLeague.prizeDistribution.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Prize Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {viewingLeague.prizeDistribution.map((dist: any, index: number) => (
                          <div key={index} className={`text-center p-3 border rounded-lg ${index === 0 ? 'bg-yellow-50 border-yellow-200' :
                            index === 1 ? 'bg-gray-50 border-gray-200' :
                              index === 2 ? 'bg-orange-50 border-orange-200' : ''
                            }`}>
                            <div className={`text-lg font-bold ${index === 0 ? 'text-yellow-600' :
                              index === 1 ? 'text-gray-600' :
                                index === 2 ? 'text-orange-600' : ''
                              }`}>
                              ${dist.amount.toLocaleString()}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {dist.position === 1 ? '1st Place' :
                                dist.position === 2 ? '2nd Place' :
                                  dist.position === 3 ? '3rd Place' :
                                    dist.position === 4 ? '4th Place' :
                                      '5th Place'}
                            </div>
                            {dist.capped && (
                              <div className="text-xs text-red-500">Capped</div>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        6th-10th Place: $200 each • 11th+ Place: $100 each
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Status Change Confirmation Dialog */}
      <AlertDialog open={!!statusChangeLeague} onOpenChange={() => setStatusChangeLeague(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {statusChangeLeague?.status === 'active' ? (
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              ) : (
                <CheckCircle className="w-5 h-5 text-green-600" />
              )}
              {statusChangeLeague?.status === 'active' ? 'Deactivate' : 'Activate'} Competition
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {statusChangeLeague?.status === 'active' ? 'deactivate' : 'activate'} the competition
              "<strong>{statusChangeLeague?.name}</strong>"?

              {statusChangeLeague?.status === 'active' && statusChangeLeague?.participantCount > 0 && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-800">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="font-medium">Warning</span>
                  </div>
                  <p className="text-sm text-yellow-700 mt-1">
                    This competition has {statusChangeLeague.participantCount} participants.
                    Deactivating may affect their ability to participate.
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isTogglingStatus}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleStatusToggle}
              disabled={isTogglingStatus}
              className={statusChangeLeague?.status === 'active' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
            >
              {isTogglingStatus ? "Processing..." :
                (statusChangeLeague?.status === 'active' ? 'Deactivate' : 'Activate')
              }
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Prize Distribution Structure */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Prize Distribution Structure
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Professional prize distribution with automatic scaling
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-3 border rounded-lg bg-yellow-50 border-yellow-200">
                <div className="text-lg font-bold text-yellow-600">30%</div>
                <div className="text-sm text-muted-foreground">1st Place</div>
                <div className="text-xs text-muted-foreground">Max $4,000</div>
              </div>
              <div className="text-center p-3 border rounded-lg bg-gray-50 border-gray-200">
                <div className="text-lg font-bold text-gray-600">25%</div>
                <div className="text-sm text-muted-foreground">2nd Place</div>
                <div className="text-xs text-muted-foreground">Max $3,000</div>
              </div>
              <div className="text-center p-3 border rounded-lg bg-orange-50 border-orange-200">
                <div className="text-lg font-bold text-orange-600">20%</div>
                <div className="text-sm text-muted-foreground">3rd Place</div>
                <div className="text-xs text-muted-foreground">Max $2,000</div>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className="text-lg font-bold">15%</div>
                <div className="text-sm text-muted-foreground">4th Place</div>
                <div className="text-xs text-muted-foreground">Max $1,500</div>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className="text-lg font-bold">10%</div>
                <div className="text-sm text-muted-foreground">5th Place</div>
                <div className="text-xs text-muted-foreground">Max $1,000</div>
              </div>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• 6th-10th Place: $200 each (fixed)</p>
              <p>• 11th+ Place: $100 each (remaining pool distributed)</p>
              <p>• Professional timeline management with automated scheduling</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};