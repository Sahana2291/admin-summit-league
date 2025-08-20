import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Crown, Medal, TrendingUp, Users, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeaderCardProps {
  rank: number;
  name: string;
  title: string;
  points: number;
  progress: number;
  teamSize: number;
  achievements: number;
  avatar: string;
  trend: "up" | "down" | "stable";
  isTopThree?: boolean;
}

const getRankIcon = (rank: number) => {
  if (rank === 1) return <Crown className="w-5 h-5 text-accent" />;
  if (rank === 2) return <Trophy className="w-5 h-5 text-muted-foreground" />;
  if (rank === 3) return <Medal className="w-5 h-5 text-warning" />;
  return null;
};

const getRankStyles = (rank: number) => {
  if (rank === 1) return "bg-gradient-accent shadow-elevated animate-pulse-glow";
  if (rank === 2) return "bg-gradient-primary shadow-glow";
  if (rank === 3) return "bg-gradient-card shadow-card border-warning/30";
  return "bg-gradient-card shadow-card";
};

export function LeaderCard({
  rank,
  name,
  title,
  points,
  progress,
  teamSize,
  achievements,
  avatar,
  trend,
  isTopThree = false
}: LeaderCardProps) {
  return (
    <Card className={cn(
      "p-6 transition-all duration-300 hover:scale-105 animate-slide-up border-border/50",
      getRankStyles(rank),
      isTopThree && "border-primary/30"
    )}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={avatar}
              alt={name}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/30"
            />
            <div className="absolute -top-2 -right-2 bg-card rounded-full p-1">
              {getRankIcon(rank) || (
                <span className="text-xs font-bold text-muted-foreground px-1">
                  #{rank}
                </span>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="font-bold text-foreground">{name}</h3>
            <p className="text-sm text-muted-foreground">{title}</p>
          </div>
        </div>

        <div className="text-right">
          <div className="flex items-center gap-1">
            <TrendingUp className={cn(
              "w-4 h-4",
              trend === "up" ? "text-secondary" : 
              trend === "down" ? "text-destructive" : "text-muted-foreground"
            )} />
            <span className="text-2xl font-bold text-primary">{points.toLocaleString()}</span>
          </div>
          <p className="text-xs text-muted-foreground">Leadership Points</p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Team:</span>
            <span className="font-medium">{teamSize}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Target className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Goals:</span>
            <span className="font-medium">{achievements}</span>
          </div>
        </div>

        {isTopThree && (
          <Badge variant="secondary" className="w-full justify-center mt-3">
            <Trophy className="w-3 h-3 mr-1" />
            Top Performer
          </Badge>
        )}
      </div>
    </Card>
  );
}