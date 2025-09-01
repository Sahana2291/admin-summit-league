import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useAuthStore } from '@/app/store/authStore';
import { useToast } from "@/hooks/use-toast";
import { Id } from "../../../convex/_generated/dataModel";
import {
    Settings,
    User,
    Lock,
    DollarSign,
    Users,
    BarChart3,
    Shield,
    Save,
    Eye,
    EyeOff,
    AlertTriangle,
    CheckCircle,
    Activity
} from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export const AdminSettings = () => {
    const [activeTab, setActiveTab] = useState("system");
    const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    const { admin } = useAuthStore();
    const { toast } = useToast();

    // Form states
    const [systemSettings, setSystemSettings] = useState({
        platformName: "",
        supportEmail: "",
        maintenanceMode: false,
        registrationEnabled: true,
        maxAccountsPerUser: 5,
        defaultEntryFee: 50
    });

    const [affiliateSettings, setAffiliateSettings] = useState({
        commissionRate: 0.10,
        minPayout: 50,
        payoutSchedule: "weekly",
        autoPayoutEnabled: false,
        referralCodeLength: 8
    });

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    const [profileForm, setProfileForm] = useState({
        name: "",
        email: ""
    });

    // Queries
    const settings = useQuery(api.admin.getSystemSettings) || { system: {}, affiliate: {} };
    const adminProfile = useQuery(api.admin.getAdminProfile,
        admin ? { adminId: admin.id as Id<"admins"> } : "skip"
    );
    const systemStats = useQuery(api.admin.getSystemStatistics) || {};

    // Mutations
    const bulkUpdateSettings = useMutation(api.admin.bulkUpdateSettings);
    const changePassword = useMutation(api.admin.changeAdminPassword);
    const updateProfile = useMutation(api.admin.updateAdminProfile);

    // Initialize form data when settings load
    useEffect(() => {
        if (settings.system) {
            setSystemSettings({
                platformName: settings.system.platformName || "",
                supportEmail: settings.system.supportEmail || "",
                maintenanceMode: settings.system.maintenanceMode || false,
                registrationEnabled: settings.system.registrationEnabled ?? true,
                maxAccountsPerUser: settings.system.maxAccountsPerUser || 5,
                defaultEntryFee: settings.system.defaultEntryFee || 50
            });
        }

        if (settings.affiliate) {
            setAffiliateSettings({
                commissionRate: settings.affiliate.commissionRate || 0.10,
                minPayout: settings.affiliate.minPayout || 50,
                payoutSchedule: settings.affiliate.payoutSchedule || "weekly",
                autoPayoutEnabled: settings.affiliate.autoPayoutEnabled || false,
                referralCodeLength: settings.affiliate.referralCodeLength || 8
            });
        }
    }, [settings]);

    // Initialize profile form
    useEffect(() => {
        if (adminProfile) {
            setProfileForm({
                name: adminProfile.name || "",
                email: adminProfile.email || ""
            });
        }
    }, [adminProfile]);

    const handleSaveSettings = async () => {
        if (!admin) return;
        setIsUpdatingSettings(true);

        try {
            const settingsToUpdate = [
                // System settings
                { key: "platform_name", value: systemSettings.platformName, type: "system" as const, description: "Platform display name" },
                { key: "support_email", value: systemSettings.supportEmail, type: "system" as const, description: "Support contact email" },
                { key: "maintenance_mode", value: systemSettings.maintenanceMode, type: "system" as const, description: "Enable maintenance mode" },
                { key: "registration_enabled", value: systemSettings.registrationEnabled, type: "system" as const, description: "Allow new user registrations" },
                { key: "max_accounts_per_user", value: systemSettings.maxAccountsPerUser, type: "system" as const, description: "Maximum trading accounts per user" },
                { key: "default_entry_fee", value: systemSettings.defaultEntryFee, type: "system" as const, description: "Default competition entry fee" },

                // Affiliate settings
                { key: "commission_rate", value: affiliateSettings.commissionRate, type: "affiliate" as const, description: "Affiliate commission rate (decimal)" },
                { key: "min_payout", value: affiliateSettings.minPayout, type: "affiliate" as const, description: "Minimum payout threshold" },
                { key: "payout_schedule", value: affiliateSettings.payoutSchedule, type: "affiliate" as const, description: "Payout frequency" },
                { key: "auto_payout_enabled", value: affiliateSettings.autoPayoutEnabled, type: "affiliate" as const, description: "Enable automatic payouts" },
                { key: "referral_code_length", value: affiliateSettings.referralCodeLength, type: "affiliate" as const, description: "Referral code length" }
            ];

            const result = await bulkUpdateSettings({
                settings: settingsToUpdate,
                adminId: admin.id as Id<"admins">
            });

            toast({
                title: "Settings Updated",
                description: `${result.updated} settings updated successfully.`,
            });

        } catch (error) {
            console.error('Error updating settings:', error);
            toast({
                title: "Error",
                description: "Failed to update settings. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsUpdatingSettings(false);
        }
    };

    const handleChangePassword = async () => {
        if (!admin) return;

        // Validation
        if (!passwordForm.currentPassword || !passwordForm.newPassword) {
            toast({
                title: "Error",
                description: "Please fill in all password fields.",
                variant: "destructive",
            });
            return;
        }

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast({
                title: "Error",
                description: "New password and confirmation don't match.",
                variant: "destructive",
            });
            return;
        }

        if (passwordForm.newPassword.length < 6) {
            toast({
                title: "Error",
                description: "Password must be at least 6 characters long.",
                variant: "destructive",
            });
            return;
        }

        setIsChangingPassword(true);

        try {
            await changePassword({
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword,
                adminId: admin.id as Id<"admins">
            });

            toast({
                title: "Password Changed",
                description: "Your password has been updated successfully.",
            });

            // Clear form
            setPasswordForm({
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            });

        } catch (error) {
            console.error('Error changing password:', error);
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to change password.",
                variant: "destructive",
            });
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleUpdateProfile = async () => {
        if (!admin) return;

        try {
            await updateProfile({
                adminId: admin.id as Id<"admins">,
                name: profileForm.name,
                email: profileForm.email
            });

            toast({
                title: "Profile Updated",
                description: "Your profile has been updated successfully.",
            });

        } catch (error) {
            console.error('Error updating profile:', error);
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to update profile.",
                variant: "destructive",
            });
        }
    };

    const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    if (!admin) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p>Access denied. Admin authentication required.</p>
                </div>
            </div>
        );
    }

    if (settings === undefined || adminProfile === undefined || Object.keys(systemStats).length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
                    <p className="mt-4 text-muted-foreground">Loading settings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Admin Settings</h1>
                    <p className="text-muted-foreground">Manage system configuration, affiliate settings, and admin account</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={handleSaveSettings}
                        disabled={isUpdatingSettings}
                        className="bg-gradient-primary text-white"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {isUpdatingSettings ? "Saving..." : "Save All Settings"}
                    </Button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-blue-600" />
                            <div>
                                <div className="text-2xl font-bold">{systemStats.users?.total || 0}</div>
                                <p className="text-sm text-muted-foreground">Total Users</p>
                                <p className="text-xs text-green-600">+{systemStats.users?.recent24h || 0} today</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-green-600" />
                            <div>
                                <div className="text-2xl font-bold">{systemStats.accounts?.total || 0}</div>
                                <p className="text-sm text-muted-foreground">Trading Accounts</p>
                                <p className="text-xs text-green-600">{systemStats.accounts?.active || 0} active</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-green-600" />
                            <div>
                                <div className="text-2xl font-bold">${(systemStats.payments?.revenue || 0).toLocaleString()}</div>
                                <p className="text-sm text-muted-foreground">Total Revenue</p>
                                <p className="text-xs text-blue-600">{systemStats.payments?.successful || 0} payments</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-2">
                            <Activity className="w-5 h-5 text-purple-600" />
                            <div>
                                <div className="text-2xl font-bold">{systemStats.activities?.recent24h || 0}</div>
                                <p className="text-sm text-muted-foreground">Activities Today</p>
                                <p className="text-xs text-muted-foreground">{systemStats.activities?.recent7d || 0} this week</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Settings Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="system" className="flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        System
                    </TabsTrigger>
                    <TabsTrigger value="affiliate" className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Affiliate
                    </TabsTrigger>
                    <TabsTrigger value="security" className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Security
                    </TabsTrigger>
                    <TabsTrigger value="profile" className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Profile
                    </TabsTrigger>
                </TabsList>

                {/* System Settings */}
                <TabsContent value="system" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Platform Configuration</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="platformName">Platform Name</Label>
                                    <Input
                                        id="platformName"
                                        value={systemSettings.platformName}
                                        onChange={(e) => setSystemSettings(prev => ({ ...prev, platformName: e.target.value }))}
                                        placeholder="Leadership League"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="supportEmail">Support Email</Label>
                                    <Input
                                        id="supportEmail"
                                        type="email"
                                        value={systemSettings.supportEmail}
                                        onChange={(e) => setSystemSettings(prev => ({ ...prev, supportEmail: e.target.value }))}
                                        placeholder="support@leadershipleague.com"
                                    />
                                </div>
                            </div>

                            <Separator />

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="maxAccounts">Max Accounts Per User</Label>
                                    <Input
                                        id="maxAccounts"
                                        type="number"
                                        min="1"
                                        max="20"
                                        value={systemSettings.maxAccountsPerUser}
                                        onChange={(e) => setSystemSettings(prev => ({ ...prev, maxAccountsPerUser: parseInt(e.target.value) || 5 }))}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="defaultFee">Default Entry Fee ($)</Label>
                                    <Input
                                        id="defaultFee"
                                        type="number"
                                        min="1"
                                        value={systemSettings.defaultEntryFee}
                                        onChange={(e) => setSystemSettings(prev => ({ ...prev, defaultEntryFee: parseFloat(e.target.value) || 50 }))}
                                    />
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label>Maintenance Mode</Label>
                                        <p className="text-sm text-muted-foreground">Temporarily disable the platform for maintenance</p>
                                    </div>
                                    <Switch
                                        checked={systemSettings.maintenanceMode}
                                        onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, maintenanceMode: checked }))}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label>User Registration</Label>
                                        <p className="text-sm text-muted-foreground">Allow new users to register</p>
                                    </div>
                                    <Switch
                                        checked={systemSettings.registrationEnabled}
                                        onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, registrationEnabled: checked }))}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Affiliate Settings */}
                <TabsContent value="affiliate" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Affiliate Configuration</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="commissionRate">Commission Rate (%)</Label>
                                    <Input
                                        id="commissionRate"
                                        type="number"
                                        min="0"
                                        max="50"
                                        step="0.01"
                                        value={(affiliateSettings.commissionRate * 100).toFixed(2)}
                                        onChange={(e) => setAffiliateSettings(prev => ({
                                            ...prev,
                                            commissionRate: parseFloat(e.target.value) / 100 || 0.10
                                        }))}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Current: {(affiliateSettings.commissionRate * 100).toFixed(1)}%
                                    </p>
                                </div>
                                <div>
                                    <Label htmlFor="minPayout">Minimum Payout ($)</Label>
                                    <Input
                                        id="minPayout"
                                        type="number"
                                        min="1"
                                        value={affiliateSettings.minPayout}
                                        onChange={(e) => setAffiliateSettings(prev => ({ ...prev, minPayout: parseFloat(e.target.value) || 50 }))}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="payoutSchedule">Payout Schedule</Label>
                                    <select
                                        id="payoutSchedule"
                                        value={affiliateSettings.payoutSchedule}
                                        onChange={(e) => setAffiliateSettings(prev => ({ ...prev, payoutSchedule: e.target.value }))}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    >
                                        <option value="weekly">Weekly</option>
                                        <option value="monthly">Monthly</option>
                                        <option value="manual">Manual Only</option>
                                    </select>
                                </div>
                                <div>
                                    <Label htmlFor="codeLength">Referral Code Length</Label>
                                    <Input
                                        id="codeLength"
                                        type="number"
                                        min="4"
                                        max="16"
                                        value={affiliateSettings.referralCodeLength}
                                        onChange={(e) => setAffiliateSettings(prev => ({
                                            ...prev,
                                            referralCodeLength: parseInt(e.target.value) || 8
                                        }))}
                                    />
                                </div>
                            </div>

                            <Separator />

                            <div className="flex items-center justify-between">
                                <div>
                                    <Label>Automatic Payouts</Label>
                                    <p className="text-sm text-muted-foreground">Automatically process payouts based on schedule</p>
                                    <Badge variant="secondary" className="mt-1">Coming Soon</Badge>
                                </div>
                                <Switch
                                    checked={affiliateSettings.autoPayoutEnabled}
                                    onCheckedChange={(checked) => setAffiliateSettings(prev => ({ ...prev, autoPayoutEnabled: checked }))}
                                    disabled
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Security Settings */}
                <TabsContent value="security" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Lock className="w-5 h-5" />
                                Change Password
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="currentPassword">Current Password</Label>
                                <div className="relative">
                                    <Input
                                        id="currentPassword"
                                        type={showPasswords.current ? "text" : "password"}
                                        value={passwordForm.currentPassword}
                                        onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3"
                                        onClick={() => togglePasswordVisibility('current')}
                                    >
                                        {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </Button>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="newPassword">New Password</Label>
                                <div className="relative">
                                    <Input
                                        id="newPassword"
                                        type={showPasswords.new ? "text" : "password"}
                                        value={passwordForm.newPassword}
                                        onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3"
                                        onClick={() => togglePasswordVisibility('new')}
                                    >
                                        {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </Button>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                <div className="relative">
                                    <Input
                                        id="confirmPassword"
                                        type={showPasswords.confirm ? "text" : "password"}
                                        value={passwordForm.confirmPassword}
                                        onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3"
                                        onClick={() => togglePasswordVisibility('confirm')}
                                    >
                                        {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </Button>
                                </div>
                            </div>

                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button disabled={isChangingPassword} className="w-full">
                                        <Lock className="w-4 h-4 mr-2" />
                                        {isChangingPassword ? "Changing Password..." : "Change Password"}
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="flex items-center gap-2">
                                            <AlertTriangle className="w-5 h-5 text-yellow-600" />
                                            Confirm Password Change
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Are you sure you want to change your admin password? You'll need to log in again with the new password.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleChangePassword}>
                                            Change Password
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Profile Settings */}
                <TabsContent value="profile" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="w-5 h-5" />
                                Admin Profile
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="adminName">Name</Label>
                                <Input
                                    id="adminName"
                                    value={profileForm.name}
                                    onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Your full name"
                                />
                            </div>

                            <div>
                                <Label htmlFor="adminEmail">Email</Label>
                                <Input
                                    id="adminEmail"
                                    type="email"
                                    value={profileForm.email}
                                    onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                                    placeholder="admin@example.com"
                                />
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <Label>Account Information</Label>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-muted-foreground">Role:</span>
                                        <Badge variant="default" className="ml-2">{adminProfile.role}</Badge>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Status:</span>
                                        <Badge variant={adminProfile.isActive ? "default" : "destructive"} className="ml-2">
                                            {adminProfile.isActive ? "Active" : "Inactive"}
                                        </Badge>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-muted-foreground">Last Updated:</span>
                                        <span className="ml-2">{new Date(adminProfile.updatedAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            <Button onClick={handleUpdateProfile} className="w-full">
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Update Profile
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};