import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Settings, RefreshCw, Download } from "lucide-react";
import leadershipTrophy from "@/assets/leadership-trophy.jpg";

export function LeadershipHeader() {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <img 
            src={leadershipTrophy} 
            alt="Leadership Trophy" 
            className="w-16 h-16 object-cover rounded-lg shadow-card"
          />
          <div>
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Super Admin Leadership League
            </h1>
            <p className="text-muted-foreground mt-1">
              Elite performance tracking & competitive rankings
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="px-3 py-1">
            <Trophy className="w-4 h-4 mr-2" />
            Season 2024
          </Badge>
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="premium" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Admin Panel
          </Button>
        </div>
      </div>

      <div className="bg-gradient-card rounded-lg p-6 border border-border/50">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">12</div>
            <div className="text-sm text-muted-foreground">Active Leaders</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-secondary">98.2%</div>
            <div className="text-sm text-muted-foreground">Avg Performance</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">156</div>
            <div className="text-sm text-muted-foreground">Goals Achieved</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-warning">24h</div>
            <div className="text-sm text-muted-foreground">Next Update</div>
          </div>
        </div>
      </div>
    </div>
  );
}