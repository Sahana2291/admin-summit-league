import { useState } from "react";
import { 
  LayoutDashboard, 
  Users, 
  TrendingUp, 
  Trophy, 
  DollarSign,
  BarChart3,
  Settings,
  UserCheck,
  Activity,
  Target,
  PieChart,
  FileText,
  LogOut
} from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

interface AdminSidebarProps {
  onLogout: () => void;
}

const navigationItems = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: LayoutDashboard,
    description: "Overview & Analytics"
  },
  {
    title: "User Management",
    url: "/admin/users",
    icon: Users,
    description: "Registered Users"
  },
  {
    title: "League Participants",
    url: "/admin/participants",
    icon: UserCheck,
    description: "Active Traders"
  },
  {
    title: "Trading Accounts",
    url: "/admin/accounts",
    icon: Activity,
    description: "Account Details"
  },
  {
    title: "Performance Analytics",
    url: "/admin/analytics",
    icon: TrendingUp,
    description: "P&L Tracking"
  },
  {
    title: "Prize Distribution",
    url: "/admin/prizes",
    icon: Trophy,
    description: "Reward Management"
  },
  {
    title: "Revenue Tracking",
    url: "/admin/revenue",
    icon: DollarSign,
    description: "Company Earnings"
  },
  {
    title: "Leaderboards",
    url: "/admin/leaderboards",
    icon: Target,
    description: "Rankings & Competitions"
  },
  {
    title: "Reports",
    url: "/admin/reports",
    icon: FileText,
    description: "Generate Reports"
  },
  {
    title: "Statistics",
    url: "/admin/statistics",
    icon: PieChart,
    description: "Platform Metrics"
  }
];

const settingsItems = [
  {
    title: "Platform Settings",
    url: "/admin/settings",
    icon: Settings,
    description: "System Configuration"
  }
];

export function AdminSidebar({ onLogout }: AdminSidebarProps) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar className={isCollapsed ? "w-16" : "w-72"}>
      <SidebarContent className="bg-gradient-card">
        {/* Header */}
        <div className="p-4 border-b border-border/50">
          {!isCollapsed ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Trophy className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-bold text-foreground">Admin Panel</h2>
                <p className="text-xs text-muted-foreground">Leadership League</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Trophy className="w-6 h-6 text-primary-foreground" />
              </div>
            </div>
          )}
        </div>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={({ isActive }) => 
                        `flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                          isActive 
                            ? "bg-primary text-primary-foreground shadow-glow" 
                            : "hover:bg-card-elevated/50 text-foreground"
                        }`
                      }
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {!isCollapsed && (
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">{item.title}</div>
                          <div className="text-xs opacity-70 truncate">{item.description}</div>
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings */}
        <SidebarGroup>
          <SidebarGroupLabel>Configuration</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={({ isActive }) => 
                        `flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                          isActive 
                            ? "bg-primary text-primary-foreground shadow-glow" 
                            : "hover:bg-card-elevated/50 text-foreground"
                        }`
                      }
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {!isCollapsed && (
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">{item.title}</div>
                          <div className="text-xs opacity-70 truncate">{item.description}</div>
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Logout */}
        <div className="mt-auto p-4 border-t border-border/50">
          <Button
            variant="outline"
            className="w-full"
            onClick={onLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            {!isCollapsed && "Logout"}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}