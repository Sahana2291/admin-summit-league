import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AdminLogin } from "@/components/AdminLogin";
import { AdminSidebar } from "@/components/AdminSidebar";
import { AdminDashboard } from "@/components/AdminDashboard";
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
        <BrowserRouter>
          <SidebarProvider>
            <div className="min-h-screen flex w-full bg-background">
              <AdminSidebar onLogout={handleLogout} />
              
              <div className="flex-1 flex flex-col">
                {/* Header with sidebar trigger */}
                <header className="h-16 border-b border-border/50 bg-card/50 backdrop-blur-sm">
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
                    
                    {/* Placeholder routes - can be expanded later */}
                    <Route path="/admin/users" element={
                      <div className="text-center py-20">
                        <h2 className="text-2xl font-bold text-muted-foreground">User Management</h2>
                        <p className="text-muted-foreground mt-2">Coming soon...</p>
                      </div>
                    } />
                    
                    <Route path="/admin/participants" element={
                      <div className="text-center py-20">
                        <h2 className="text-2xl font-bold text-muted-foreground">League Participants</h2>
                        <p className="text-muted-foreground mt-2">Coming soon...</p>
                      </div>
                    } />
                    
                    <Route path="/admin/accounts" element={
                      <div className="text-center py-20">
                        <h2 className="text-2xl font-bold text-muted-foreground">Trading Accounts</h2>
                        <p className="text-muted-foreground mt-2">Coming soon...</p>
                      </div>
                    } />
                    
                    <Route path="/admin/analytics" element={
                      <div className="text-center py-20">
                        <h2 className="text-2xl font-bold text-muted-foreground">Performance Analytics</h2>
                        <p className="text-muted-foreground mt-2">Coming soon...</p>
                      </div>
                    } />
                    
                    <Route path="/admin/prizes" element={
                      <div className="text-center py-20">
                        <h2 className="text-2xl font-bold text-muted-foreground">Prize Distribution</h2>
                        <p className="text-muted-foreground mt-2">Coming soon...</p>
                      </div>
                    } />
                    
                    <Route path="/admin/revenue" element={
                      <div className="text-center py-20">
                        <h2 className="text-2xl font-bold text-muted-foreground">Revenue Tracking</h2>
                        <p className="text-muted-foreground mt-2">Coming soon...</p>
                      </div>
                    } />
                    
                    <Route path="/admin/leaderboards" element={
                      <div className="text-center py-20">
                        <h2 className="text-2xl font-bold text-muted-foreground">Leaderboards</h2>
                        <p className="text-muted-foreground mt-2">Coming soon...</p>
                      </div>
                    } />
                    
                    <Route path="/admin/reports" element={
                      <div className="text-center py-20">
                        <h2 className="text-2xl font-bold text-muted-foreground">Reports</h2>
                        <p className="text-muted-foreground mt-2">Coming soon...</p>
                      </div>
                    } />
                    
                    <Route path="/admin/statistics" element={
                      <div className="text-center py-20">
                        <h2 className="text-2xl font-bold text-muted-foreground">Statistics</h2>
                        <p className="text-muted-foreground mt-2">Coming soon...</p>
                      </div>
                    } />
                    
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
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default Index;