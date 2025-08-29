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
  LogOut,
  Calendar,
  Award,
  Wallet,
  HandHeart,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { NavLink, useLocation } from "react-router";
import { Button } from "@/components/ui/button";

interface AdminSidebarProps {
  onLogout: () => void;
}

export function AdminSidebar({ onLogout }: AdminSidebarProps) {
  const location = useLocation();

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    competition: true,
    people: true,
    money: true,
    growth: true
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const isActive = (path: string) => location.pathname === path;

  const getNavClasses = (path: string) => {
    return `flex items-center gap-3 w-full px-3 py-2.5 text-left rounded-xl transition-smooth ${isActive(path)
      ? "bg-gradient-to-r from-red-500/20 to-transparent border border-red-500/50 text-white"
      : "text-gray-300 hover:bg-white/5 hover:text-white"
      }`;
  };

  const getSubNavClasses = (path: string) => {
    return `flex items-center gap-3 w-full px-3 py-2 ml-4 text-left rounded-lg transition-smooth text-sm ${isActive(path)
      ? "bg-gradient-to-r from-red-500/20 to-transparent border border-red-500/50 text-white"
      : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
      }`;
  };

  return (
    <aside className="w-72 h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 border-r border-gray-700 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-3 p-6 border-b border-gray-700">
        <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow">
          <Trophy className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white">League Admin</h1>
          <span className="text-xs bg-gradient-primary px-2 py-1 rounded-full text-white font-medium">
            Super
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {/* Overview */}
        <div className="space-y-1">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
            Overview
          </div>
          <NavLink to="/admin" className={getNavClasses("/admin")}>
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </NavLink>
        </div>

        {/* Competition */}
        <div className="space-y-1">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
            Competition
          </div>

          <div className="space-y-1">
            <button
              onClick={() => toggleSection('competition')}
              className="flex items-center gap-2 w-full px-3 py-2 text-left text-gray-300 hover:text-white transition-smooth"
            >
              <Trophy className="w-4 h-4" />
              <span className="text-sm font-medium">Weeks & Competitions</span>
              {openSections.competition ?
                <ChevronDown className="w-4 h-4 ml-auto" /> :
                <ChevronRight className="w-4 h-4 ml-auto" />
              }
            </button>
            {openSections.competition && (
              <div className="space-y-1">
                <NavLink to="/admin/competitions" className={getSubNavClasses("/admin/competitions")}>
                  <Calendar className="w-4 h-4" />
                  <span>Manage Weeks</span>
                </NavLink>
                <NavLink to="/admin/entries" className={getSubNavClasses("/admin/entries")}>
                  <FileText className="w-4 h-4" />
                  <span>Entries</span>
                </NavLink>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <button
              onClick={() => toggleSection('leaderboards')}
              className="flex items-center gap-2 w-full px-3 py-2 text-left text-gray-300 hover:text-white transition-smooth"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="text-sm font-medium">Leaderboards</span>
              {openSections.leaderboards ?
                <ChevronDown className="w-4 h-4 ml-auto" /> :
                <ChevronRight className="w-4 h-4 ml-auto" />
              }
            </button>
            {openSections.leaderboards && (
              <div className="space-y-1">
                <NavLink to="/admin/leaderboards" className={getSubNavClasses("/admin/leaderboards")}>
                  <Target className="w-4 h-4" />
                  <span>Weights & Snapshots</span>
                </NavLink>
              </div>
            )}
          </div>
        </div>

        {/* People */}
        <div className="space-y-1">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
            People
          </div>

          <NavLink to="/admin/user-dashboard" className={getNavClasses("/admin/user-dashboard")}>
            <Users className="w-5 h-5" />
            <span>User Dashboard</span>
          </NavLink>

          <div className="space-y-1">
            <button
              onClick={() => toggleSection('people')}
              className="flex items-center gap-2 w-full px-3 py-2 text-left text-gray-300 hover:text-white transition-smooth"
            >
              <UserCheck className="w-4 h-4" />
              <span className="text-sm font-medium">Participants & Accounts</span>
              {openSections.people ?
                <ChevronDown className="w-4 h-4 ml-auto" /> :
                <ChevronRight className="w-4 h-4 ml-auto" />
              }
            </button>
            {openSections.people && (
              <div className="space-y-1">
                <NavLink to="/admin/participants" className={getSubNavClasses("/admin/participants")}>
                  <Users className="w-4 h-4" />
                  <span>Participants</span>
                </NavLink>
                <NavLink to="/admin/accounts" className={getSubNavClasses("/admin/accounts")}>
                  <Activity className="w-4 h-4" />
                  <span>Trader Profiles</span>
                </NavLink>
              </div>
            )}
          </div>
        </div>

        {/* Money */}
        <div className="space-y-1">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
            Money
          </div>

          <div className="space-y-1">
            <button
              onClick={() => toggleSection('money')}
              className="flex items-center gap-2 w-full px-3 py-2 text-left text-gray-300 hover:text-white transition-smooth"
            >
              <Award className="w-4 h-4" />
              <span className="text-sm font-medium">Rewards & Prize Pool</span>
              {openSections.money ?
                <ChevronDown className="w-4 h-4 ml-auto" /> :
                <ChevronRight className="w-4 h-4 ml-auto" />
              }
            </button>
            {openSections.money && (
              <div className="space-y-1">
                <NavLink to="/admin/prizes" className={getSubNavClasses("/admin/prizes")}>
                  <Trophy className="w-4 h-4" />
                  <span>Distribution</span>
                </NavLink>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <button
              onClick={() => toggleSection('claims')}
              className="flex items-center gap-2 w-full px-3 py-2 text-left text-gray-300 hover:text-white transition-smooth"
            >
              <Wallet className="w-4 h-4" />
              <span className="text-sm font-medium">Claims & Payouts</span>
              <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">3</span>
              {openSections.claims ?
                <ChevronDown className="w-4 h-4" /> :
                <ChevronRight className="w-4 h-4" />
              }
            </button>
            {openSections.claims && (
              <div className="space-y-1">
                <NavLink to="/admin/revenue" className={getSubNavClasses("/admin/revenue")}>
                  <DollarSign className="w-4 h-4" />
                  <span>Claim Queue</span>
                </NavLink>
              </div>
            )}
          </div>
        </div>

        {/* Growth */}
        <div className="space-y-1">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
            Growth
          </div>

          <NavLink to="/admin/affiliates" className={getNavClasses("/admin/affiliates")}>
            <HandHeart className="w-5 h-5" />
            <span>Affiliate Details</span>
          </NavLink>

          <NavLink to="/admin/reports" className={getNavClasses("/admin/reports")}>
            <TrendingUp className="w-5 h-5" />
            <span>Reports & Analytics</span>
          </NavLink>
        </div>
      </nav>

      {/* Quick Action */}
      <div className="p-4 border-t border-gray-700 mt-auto">
        <NavLink to="/admin/competitions">
          <Button className="w-full bg-gradient-primary hover:opacity-90 text-white font-semibold shadow-glow">
            ＋ Quick Create Week
          </Button>
        </NavLink>
      </div>

      {/* Logout */}
      <div className="p-4">
        <Button
          variant="outline"
          className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
          onClick={onLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </aside>
  );
}