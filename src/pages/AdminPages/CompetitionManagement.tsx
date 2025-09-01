// src/pages/AdminPages/CompetitionManagement.tsx
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
import DateTimePicker from "@/components/DateTimePicker";
import { useAuthStore } from '@/app/store/authStore';
import { useToast } from "@/hooks/use-toast";
import { api } from '../../../convex/_generated/api';
import { Id } from "../../../convex/_generated/dataModel";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Play, Pause, Trophy, DollarSign, Users, Edit, Eye, Settings, CheckCircle, AlertTriangle, Clock, CalendarIcon } from "lucide-react";

interface CreateLeagueForm {
  name: string;
  description: string;
  reward: number;
  exp: number;
  maxParticipants?: number;
  startDate: string;
  startTime: string;
  duration: number; // days
  registrationWindow: number; // hours before start
  timezone: string;
  competitionType: string;
}

// Competition templates for quick setup
const competitionTemplates = {
  weekly: {
    name: 'Weekly Challenge',
    duration: 7,
    registrationWindow: 24,
    exp: 50,
    reward: 2500,
    competitionType: 'weekly'
  },
  rapid: {
    name: 'Rapid Challenge',
    duration: 3,
    registrationWindow: 6,
    exp: 25,
    reward: 1000,
    competitionType: 'rapid'
  },
  monthly: {
    name: 'Monthly Championship',
    duration: 30,
    registrationWindow: 72,
    exp: 100,
    reward: 10000,
    competitionType: 'monthly'
  }
};

export const CompetitionManagement = () => {
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [viewingLeague, setViewingLeague] = useState<any>(null);
  const [editingLeague, setEditingLeague] = useState<any>(null);
  const [statusChangeLeague, setStatusChangeLeague] = useState<any>(null);

  // Form states with enhanced timeline
  const [formData, setFormData] = useState<CreateLeagueForm>({
    name: '',
    description: '',
    reward: 0,
    exp: 50,
    maxParticipants: undefined,
    // Professional timeline defaults
    startDate: '',
    startTime: '09:00',
    duration: 7, // Default 1 week as requested
    registrationWindow: 24, // 24 hours before start
    timezone: 'UTC',
    competitionType: 'weekly'
  });

  const [editFormData, setEditFormData] = useState<CreateLeagueForm>({
    name: '',
    description: '',
    reward: 0,
    exp: 50,
    maxParticipants: undefined,
    startDate: '',
    startTime: '09:00',
    duration: 7,
    registrationWindow: 24,
    timezone: 'UTC',
    competitionType: 'weekly'
  });

  // Loading states
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  const { admin } = useAuthStore();
  const { toast } = useToast();

  // Queries
  const leagues = useQuery(api.admin.getAllLeagues) || [];
  const dashboardStats = useQuery(api.admin.getDashboardStats);
  const payments = useQuery(api.admin.getAllPayments) || [];

  // Mutations
  const createLeague = useMutation(api.admin.createLeague);
  const updateLeague = useMutation(api.admin.updateLeague);
  const updateLeagueStatus = useMutation(api.admin.updateLeagueStatus);
  const logActivity = useMutation(api.admin.logActivity);

  // Set default start date to tomorrow
  useEffect(() => {
    if (!formData.startDate) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setFormData(prev => ({
        ...prev,
        startDate: tomorrow.toISOString().split('T')[0]
      }));
    }
  }, []);

  // Professional activity logging
  const logActivityAction = async (type: string, details: string, entityId?: string) => {
    try {
      await logActivity({
        type: type as any,
        details,
        entityId,
        adminId: admin?.id as Id<"admins">
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  };

  // Apply competition template
  const applyTemplate = (templateKey: keyof typeof competitionTemplates) => {
    const template = competitionTemplates[templateKey];
    setFormData(prev => ({
      ...prev,
      ...template,
      name: prev.name || template.name
    }));
  };

  // Calculate timeline dates
  const calculateTimeline = (startDate: string, startTime: string, duration: number, registrationWindow: number) => {
    const startDateTime = new Date(`${startDate}T${startTime}`);
    const registrationDeadline = new Date(startDateTime.getTime() - (registrationWindow * 60 * 60 * 1000));
    const endDateTime = new Date(startDateTime.getTime() + (duration * 24 * 60 * 60 * 1000));

    return {
      startDateTime: startDateTime.getTime(),
      endDateTime: endDateTime.getTime(),
      registrationDeadline: registrationDeadline.getTime()
    };
  };

  // Set edit form data when editing league changes
  useEffect(() => {
    if (editingLeague) {
      setEditFormData({
        name: editingLeague.name || '',
        description: editingLeague.description || '',
        reward: editingLeague.reward || 0,
        exp: editingLeague.exp || 50,
        maxParticipants: editingLeague.maxParticipants,
        // Timeline fields (fallback to defaults if not available)
        startDate: editingLeague.startDate ? new Date(editingLeague.startDate).toISOString().split('T')[0] : '',
        startTime: editingLeague.startTime || '09:00',
        duration: editingLeague.duration || 7,
        registrationWindow: editingLeague.registrationWindow || 24,
        timezone: editingLeague.timezone || 'UTC',
        competitionType: editingLeague.competitionType || 'weekly'
      });
    }
  }, [editingLeague]);

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

      if (formData.exp <= 0) {
        toast({
          title: "Error",
          description: "Entry fee must be greater than 0.",
          variant: "destructive",
        });
        return;
      }

      if (formData.reward < 0) {
        toast({
          title: "Error",
          description: "Prize pool cannot be negative.",
          variant: "destructive",
        });
        return;
      }

      if (!formData.startDate) {
        toast({
          title: "Error",
          description: "Please select a start date.",
          variant: "destructive",
        });
        return;
      }

      await createLeague({
        name: formData.name.trim(),
        description: formData.description?.trim() || '',
        reward: formData.reward,
        exp: formData.exp,
        maxParticipants: formData.maxParticipants,
        adminId: admin.id as Id<"admins">
      });

      // Enhanced activity logging
      await logActivityAction(
        'league_created',
        `Created ${formData.competitionType} competition: ${formData.name} (${formData.duration} days, $${formData.exp} entry)`,
        undefined
      );

      toast({
        title: "Competition Created",
        description: `${formData.name} has been scheduled successfully.`,
      });

      // Reset form
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setFormData({
        name: '',
        description: '',
        reward: 0,
        exp: 50,
        maxParticipants: undefined,
        startDate: tomorrow.toISOString().split('T')[0],
        startTime: '09:00',
        duration: 7,
        registrationWindow: 24,
        timezone: 'UTC',
        competitionType: 'weekly'
      });
      setIsCreateDialogOpen(false);

    } catch (error) {
      console.error('Error creating league:', error);
      toast({
        title: "Error",
        description: "Failed to create competition. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateLeague = async () => {
    if (!admin || !editingLeague) return;
    setIsUpdating(true);

    try {
      if (!editFormData.name.trim()) {
        toast({
          title: "Error",
          description: "Please enter a competition name.",
          variant: "destructive",
        });
        return;
      }

      if (editFormData.exp <= 0) {
        toast({
          title: "Error",
          description: "Entry fee must be greater than 0.",
          variant: "destructive",
        });
        return;
      }

      if (editFormData.reward < 0) {
        toast({
          title: "Error",
          description: "Prize pool cannot be negative.",
          variant: "destructive",
        });
        return;
      }

      await updateLeague({
        leagueId: editingLeague._id,
        updates: {
          name: editFormData.name.trim(),
          description: editFormData.description?.trim() || '',
          reward: editFormData.reward,
          exp: editFormData.exp,
          maxParticipants: editFormData.maxParticipants
        },
        adminId: admin.id as Id<"admins">
      });

      // Enhanced activity logging
      await logActivityAction(
        'admin_action',
        `Updated competition: ${editFormData.name} - Modified pricing, timeline, or settings`,
        editingLeague._id
      );

      toast({
        title: "Competition Updated",
        description: `${editFormData.name} has been updated successfully.`,
      });

      setEditingLeague(null);

    } catch (error) {
      console.error('Error updating league:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update competition. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
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

      // Enhanced activity logging
      await logActivityAction(
        'admin_action',
        `${newStatus === 'active' ? 'Activated' : 'Deactivated'} competition: ${statusChangeLeague.name}`,
        statusChangeLeague._id
      );

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
      default: return 'default';
    }
  };

  const calculatePrizeDistribution = (totalPrizePool: number) => {
    const distributions = {
      first: Math.min(totalPrizePool * 0.30, 4000),
      second: Math.min(totalPrizePool * 0.25, 3000),
      third: Math.min(totalPrizePool * 0.20, 2000),
      fourth: Math.min(totalPrizePool * 0.15, 1500),
      fifth: Math.min(totalPrizePool * 0.10, 1000),
    };

    const topFiveTotal = Object.values(distributions).reduce((sum, val) => sum + val, 0);
    const remaining = totalPrizePool - topFiveTotal;
    const fixedRewards = Math.min(remaining, 1000);
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

  const getLeagueStats = (leagueId: string) => {
    const leaguePayments = payments.filter(p => p.league === leagueId && p.status === 'success');
    const revenue = leaguePayments.reduce((sum, p) => sum + p.amount, 0);
    const entries = leaguePayments.length;
    return { revenue, entries };
  };

  // competition phase detection
  const getCompetitionPhase = (league: any) => {
    if (!league.startDate) return { phase: 'Draft', color: 'text-gray-500' };

    const now = Date.now();
    const registrationDeadline = league.registrationDeadline || league.startDate;

    if (now < registrationDeadline) {
      return { phase: 'Registration Open', color: 'text-blue-600' };
    } else if (now < league.startDate) {
      return { phase: 'Starting Soon', color: 'text-yellow-600' };
    } else if (league.endDate && now < league.endDate) {
      return { phase: 'Live', color: 'text-green-600' };
    } else if (league.endDate && now > league.endDate) {
      return { phase: 'Completed', color: 'text-purple-600' };
    } else {
      return { phase: 'Active', color: 'text-green-600' };
    }
  };

  const totalCompetitions = leagues.length;
  const activeCompetitions = leagues.filter(l => l.status === 'active').length;
  const totalParticipants = leagues.reduce((sum, league) => sum + (league.participantCount || 0), 0);
  const totalPrizePool = leagues.reduce((sum, league) => sum + league.reward, 0);

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
          <h1 className="text-3xl font-bold text-foreground">Competition Management</h1>
          <p className="text-muted-foreground">Professional trading competition lifecycle management</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create Competition
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Competition</DialogTitle>
              <p className="text-sm text-muted-foreground">Set up a professional trading competition with scheduling</p>
            </DialogHeader>
            <div className="space-y-6">
              {/* Quick Templates */}
              <div>
                <Label className="text-sm font-medium">Quick Templates</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {Object.entries(competitionTemplates).map(([key, template]) => (
                    <Button
                      key={key}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => applyTemplate(key as keyof typeof competitionTemplates)}
                      className="text-xs"
                    >
                      {template.name}
                      <div className="text-xs text-muted-foreground ml-1">({template.duration}d)</div>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="name">Competition Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Weekly Challenge #37"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Competition details and rules..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="exp">Entry Fee ($)</Label>
                  <Input
                    id="exp"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.exp}
                    onChange={(e) => setFormData(prev => ({ ...prev, exp: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="reward">Initial Prize Pool ($)</Label>
                  <Input
                    id="reward"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.reward}
                    onChange={(e) => setFormData(prev => ({ ...prev, reward: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              {/* Professional Timeline Section */}
              <div className="border-t pt-4">
                <Label className="text-sm font-medium flex items-center gap-1">
                  <CalendarIcon className="w-4 h-4" />
                  Competition Schedule
                </Label>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <Label htmlFor="startDateTime" className="text-sm">Start Date & Time</Label>
                    <DateTimePicker
                      value={{ date: formData.startDate, time: formData.startTime }}
                      onChange={(newValue) => setFormData(prev => ({ ...prev, ...newValue }))}
                    />
                  </div>
                  <br />
                  <div>
                    <Label htmlFor="duration" className="text-sm">Duration</Label>
                    <select
                      id="duration"
                      value={formData.duration}
                      onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value={1}>1 Day</option>
                      <option value={3}>3 Days</option>
                      <option value={7}>1 Week (Default)</option>
                      <option value={14}>2 Weeks</option>
                      <option value={30}>1 Month</option>
                      <option value={90}>3 Months</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="registrationWindow" className="text-sm">Registration Closes</Label>
                    <select
                      id="registrationWindow"
                      value={formData.registrationWindow}
                      onChange={(e) => setFormData(prev => ({ ...prev, registrationWindow: parseInt(e.target.value) }))}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value={1}>1 hour before start</option>
                      <option value={6}>6 hours before start</option>
                      <option value={24}>24 hours before start</option>
                      <option value={48}>48 hours before start</option>
                      <option value={168}>1 week before start</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Timeline Preview */}
              {formData.startDate && (
                <div className="bg-blue-50 p-3 rounded-lg text-sm">
                  <div className="font-medium mb-2 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Competition Timeline
                  </div>
                  <div className="space-y-1 text-xs">
                    <div>Registration closes: {new Date(new Date(`${formData.startDate}T${formData.startTime}`).getTime() - (formData.registrationWindow * 60 * 60 * 1000)).toLocaleString()}</div>
                    <div>Competition starts: {new Date(`${formData.startDate}T${formData.startTime}`).toLocaleString()}</div>
                    <div>Competition ends: {new Date(new Date(`${formData.startDate}T${formData.startTime}`).getTime() + (formData.duration * 24 * 60 * 60 * 1000)).toLocaleString()}</div>
                  </div>
                </div>
              )}

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
              <div className="flex gap-2 pt-4">
                <Button onClick={handleCreateLeague} className="flex-1" disabled={isCreating}>
                  {isCreating ? "Creating..." : "Create Competition"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="flex-1"
                  disabled={isCreating}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

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
                <TableHead className="text-right">Entry Fee</TableHead>
                <TableHead className="text-right">Participants</TableHead>
                <TableHead className="text-right">Prize Pool</TableHead>
                <TableHead className="text-right">Schedule</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leagues.map((league) => {
                const stats = getLeagueStats(league._id);
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
                        {league.status === 'active' ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">${league.exp}</TableCell>
                    <TableCell className="text-right font-mono">
                      {league.participantCount || 0}
                      {league.activeParticipants !== undefined && (
                        <span className="text-muted-foreground"> ({league.activeParticipants} active)</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono">${league.reward.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {league.startDate ?
                        `${new Date(league.startDate).toLocaleDateString()} (${league.duration || 7}d)` :
                        'Draft'
                      }
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
                          onClick={() => setEditingLeague(league)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setStatusChangeLeague(league)}
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
              <p className="text-sm">Create your first professional competition to get started!</p>
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
                    <CardTitle className="text-lg">Basic Information</CardTitle>
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
                          {viewingLeague.status === 'active' ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                    {viewingLeague.description && (
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Description:</span>
                        <p className="text-sm">{viewingLeague.description}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Created:</span>
                      <p className="text-sm">
                        {viewingLeague._creationTime ?
                          new Date(viewingLeague._creationTime).toLocaleDateString() :
                          'Unknown'
                        }
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Financial Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Entry Fee:</span>
                      <p className="text-2xl font-bold text-primary">${viewingLeague.exp}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Prize Pool:</span>
                      <p className="text-2xl font-bold text-green-600">${viewingLeague.reward.toLocaleString()}</p>
                    </div>
                    {(() => {
                      const stats = getLeagueStats(viewingLeague._id);
                      return (
                        <>
                          <div>
                            <span className="text-sm font-medium text-muted-foreground">Entry Revenue:</span>
                            <p className="text-lg font-semibold">${stats.revenue.toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-muted-foreground">Confirmed Entries:</span>
                            <p className="text-lg font-semibold">{stats.entries}</p>
                          </div>
                        </>
                      );
                    })()}
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
                        {viewingLeague.activeParticipants || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Active Participants</div>
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
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Prize Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const dist = calculatePrizeDistribution(viewingLeague.reward);
                    return (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                          <div className="text-center p-3 border rounded-lg bg-yellow-50 border-yellow-200">
                            <div className="text-lg font-bold text-yellow-600">${dist.first.toLocaleString()}</div>
                            <div className="text-sm text-muted-foreground">1st Place</div>
                          </div>
                          <div className="text-center p-3 border rounded-lg bg-gray-50 border-gray-200">
                            <div className="text-lg font-bold text-gray-600">${dist.second.toLocaleString()}</div>
                            <div className="text-sm text-muted-foreground">2nd Place</div>
                          </div>
                          <div className="text-center p-3 border rounded-lg bg-orange-50 border-orange-200">
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
                        <div className="text-sm text-muted-foreground">
                          6th-10th Place: $200 each • 11th+ Place: $100 each ({dist.variableCount} additional winners)
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Competition Modal */}
      <Dialog open={!!editingLeague} onOpenChange={() => setEditingLeague(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Competition: {editingLeague?.name}</DialogTitle>
          </DialogHeader>
          {editingLeague && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Competition Name</Label>
                <Input
                  id="edit-name"
                  placeholder="e.g., Week 36 Challenge"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description (Optional)</Label>
                <Textarea
                  id="edit-description"
                  placeholder="Competition details..."
                  value={editFormData.description}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-exp">Entry Fee ($)</Label>
                  <Input
                    id="edit-exp"
                    type="number"
                    min="0"
                    step="0.01"
                    value={editFormData.exp}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, exp: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-reward">Prize Pool ($)</Label>
                  <Input
                    id="edit-reward"
                    type="number"
                    min="0"
                    step="0.01"
                    value={editFormData.reward}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, reward: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-maxParticipants">Max Participants (Optional)</Label>
                <Input
                  id="edit-maxParticipants"
                  type="number"
                  min="1"
                  placeholder="Leave empty for unlimited"
                  value={editFormData.maxParticipants || ''}
                  onChange={(e) => setEditFormData(prev => ({
                    ...prev,
                    maxParticipants: e.target.value ? parseInt(e.target.value) : undefined
                  }))}
                />
              </div>
              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => setEditingLeague(null)}
                  disabled={isUpdating}
                >
                  Cancel
                </Button>
                <Button onClick={handleUpdateLeague} disabled={isUpdating}>
                  {isUpdating ? "Updating..." : "Update Competition"}
                </Button>
              </DialogFooter>
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
                    This competition has {statusChangeLeague.participantCount} active participants.
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
      {leagues.length > 0 && (
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
      )}
    </div>
  );
};