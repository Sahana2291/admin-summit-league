import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AdminLogin } from "@/components/AdminLogin";
import { AdminSidebar } from "@/components/AdminSidebar";
import { AdminDashboard } from "@/components/AdminDashboard";
import { UserManagement } from "@/components/AdminPages/UserManagement";
import { TraderAccounts } from "@/components/AdminPages/TraderAccounts";
import { CompetitionManagement } from "@/components/AdminPages/CompetitionManagement";
import { EntriesManagement } from "@/components/AdminPages/EntriesManagement";
import { LeaderboardManagement } from "@/components/AdminPages/LeaderboardManagement";
import { FinancialManagement } from "@/components/AdminPages/FinancialManagement";
import { AffiliateManagement } from "@/components/AdminPages/AffiliateManagement";
import { ReportsAnalytics } from "@/components/AdminPages/ReportsAnalytics";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

const queryClient = new QueryClient();

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminUser, setAdminUser] = useState<{ email: string; password: string } | null>(null);

  const handleLogin = (email: string, password: string) => {
    // Simple validation - in production, this would be secured
    if (email && password) {
      setAdminUser({ email, password });
      setIsLoggedIn(true);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setAdminUser(null);
  };

  if (!isLoggedIn) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AdminLogin onLogin={handleLogin} />
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SidebarProvider>
          <div className="min-h-screen flex w-full bg-background">
            <AdminSidebar onLogout={handleLogout} />
            
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Header with sidebar trigger */}
              <header className="h-16 border-b border-border/50 bg-card/50 backdrop-blur-sm flex-shrink-0">
                <div className="flex items-center h-full px-6 gap-4">
                  <SidebarTrigger>
                    <Button variant="outline" size="sm">
                      <Menu className="w-4 h-4" />
                    </Button>
                  </SidebarTrigger>
                  
                  <div className="flex-1" />
                  
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-muted-foreground">
                      Welcome back, <span className="font-medium text-foreground">{adminUser?.email}</span>
                    </div>
                  </div>
                </div>
              </header>

              {/* Main content */}
              <main className="flex-1 p-6 overflow-auto">
                <Routes>
                    <Route path="/" element={<AdminDashboard />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/users" element={<UserManagement />} />
                    <Route path="/admin/participants" element={<UserManagement />} />
                    <Route path="/admin/user-dashboard" element={<UserManagement />} />
                    <Route path="/admin/accounts" element={<TraderAccounts />} />
                    <Route path="/admin/analytics" element={<ReportsAnalytics />} />
                    <Route path="/admin/competitions" element={<CompetitionManagement />} />
                    <Route path="/admin/entries" element={<EntriesManagement />} />
                    <Route path="/admin/leaderboards" element={<LeaderboardManagement />} />
                    <Route path="/admin/prizes" element={<FinancialManagement />} />
                    <Route path="/admin/revenue" element={<FinancialManagement />} />
                    <Route path="/admin/ledger" element={<FinancialManagement />} />
                    <Route path="/admin/affiliates" element={<AffiliateManagement />} />
                    <Route path="/admin/reports" element={<ReportsAnalytics />} />
                    <Route path="/admin/statistics" element={<ReportsAnalytics />} />
                    <Route path="/admin/settings" element={
                      <div className="text-center py-20">
                        <h2 className="text-2xl font-bold text-muted-foreground">Platform Settings</h2>
                        <p className="text-muted-foreground mt-2">Coming soon...</p>
                      </div>
                    } />
                    
                    {/* Catch all */}
                    <Route path="*" element={<AdminDashboard />} />
                  </Routes>
                </main>
              </div>
            </div>
        </SidebarProvider>
        
        <Toaster />
        <Sonner />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default Index;