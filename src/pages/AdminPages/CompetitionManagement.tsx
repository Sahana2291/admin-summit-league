// src/pages/AdminPages/CompetitionManagement.tsx
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Play, Pause, Trophy, DollarSign, Users, Calendar, Edit, Trash2, Eye, Settings, CheckCircle, AlertTriangle } from "lucide-react";
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useAuthStore } from '@/app/store/authStore';
import { useToast } from "@/hooks/use-toast";
import { Id } from "../../../convex/_generated/dataModel";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface CreateLeagueForm {
  name: string;
  description: string;
  reward: number;
  exp: number;
  maxParticipants?: number;
}

export const CompetitionManagement = () => {
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [viewingLeague, setViewingLeague] = useState<any>(null);
  const [editingLeague, setEditingLeague] = useState<any>(null);
  const [statusChangeLeague, setStatusChangeLeague] = useState<any>(null);

  // Form states
  const [formData, setFormData] = useState<CreateLeagueForm>({
    name: '',
    description: '',
    reward: 0,
    exp: 50,
    maxParticipants: undefined
  });

  const [editFormData, setEditFormData] = useState<CreateLeagueForm>({
    name: '',
    description: '',
    reward: 0,
    exp: 50,
    maxParticipants: undefined
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

  // Set edit form data when editing league changes
  useEffect(() => {
    if (editingLeague) {
      setEditFormData({
        name: editingLeague.name || '',
        description: editingLeague.description || '',
        reward: editingLeague.reward || 0,
        exp: editingLeague.exp || 50,
        maxParticipants: editingLeague.maxParticipants
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

      await createLeague({
        name: formData.name.trim(),
        description: formData.description?.trim() || '',
        reward: formData.reward,
        exp: formData.exp,
        maxParticipants: formData.maxParticipants,
        adminId: admin.id as Id<"admins">
      });

      toast({
        title: "Competition Created",
        description: `${formData.name} has been created successfully.`,
      });

      // Reset form
      setFormData({
        name: '',
        description: '',
        reward: 0,
        exp: 50,
        maxParticipants: undefined
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
    // Prize distribution based on your structure
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

  // Get league-specific statistics
  const getLeagueStats = (leagueId: string) => {
    const leaguePayments = payments.filter(p => p.league === leagueId && p.status === 'success');
    const revenue = leaguePayments.reduce((sum, p) => sum + p.amount, 0);
    const entries = leaguePayments.length;
    return { revenue, entries };
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
          <p className="text-muted-foreground">Manage trading competitions and prize pools</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create Competition
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Competition</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Competition Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Week 36 Challenge"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Competition details..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
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
          <CardTitle>Active Competitions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Competition</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Entry Fee</TableHead>
                <TableHead className="text-right">Participants</TableHead>
                <TableHead className="text-right">Prize Pool</TableHead>
                <TableHead className="text-right">Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leagues.map((league) => {
                const stats = getLeagueStats(league._id);
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
                      {league.createdAt ? new Date(league.createdAt).toLocaleDateString() : 'N/A'}
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
              <p className="text-sm">Create your first competition to get started!</p>
            </div>
          )}
        </CardContent>
      </Card>

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
                Example for competitions with substantial prize pools (adjusts automatically based on total amount)
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
                <p>• Company retains 15% administration fee</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
                        {viewingLeague.createdAt ?
                          new Date(viewingLeague.createdAt).toLocaleDateString() :
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
    </div>
  );
};