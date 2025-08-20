import { LeadershipHeader } from "@/components/LeadershipHeader";
import { LeaderCard } from "@/components/LeaderCard";
import { StatsCard } from "@/components/StatsCard";
import { 
  Users, Target, TrendingUp, Award, 
  BarChart3, Shield, Zap, Clock 
} from "lucide-react";

const mockLeaders = [
  {
    rank: 1,
    name: "Sarah Chen",
    title: "VP Engineering",
    points: 2847,
    progress: 94,
    teamSize: 25,
    achievements: 12,
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b787?w=400&h=400&fit=crop&crop=face",
    trend: "up" as const
  },
  {
    rank: 2,
    name: "Marcus Rodriguez",
    title: "Head of Operations",
    points: 2634,
    progress: 87,
    teamSize: 18,
    achievements: 10,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    trend: "up" as const
  },
  {
    rank: 3,
    name: "Emily Watson",
    title: "Director of Sales",
    points: 2512,
    progress: 91,
    teamSize: 22,
    achievements: 11,
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
    trend: "stable" as const
  },
  {
    rank: 4,
    name: "James Park",
    title: "Product Manager",
    points: 2389,
    progress: 82,
    teamSize: 15,
    achievements: 9,
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    trend: "down" as const
  },
  {
    rank: 5,
    name: "Lisa Thompson",
    title: "HR Director",
    points: 2156,
    progress: 78,
    teamSize: 12,
    achievements: 8,
    avatar: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400&h=400&fit=crop&crop=face",
    trend: "up" as const
  },
  {
    rank: 6,
    name: "David Kim",
    title: "Tech Lead",
    points: 1987,
    progress: 85,
    teamSize: 8,
    achievements: 7,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
    trend: "up" as const
  }
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <LeadershipHeader />

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Leaders"
            value={12}
            subtitle="Active this month"
            trend="up"
            trendValue="+2"
            icon={<Users className="w-6 h-6 text-primary" />}
            variant="primary"
          />
          <StatsCard
            title="Goals Completed"
            value={156}
            subtitle="This quarter"
            trend="up"
            trendValue="+23%"
            icon={<Target className="w-6 h-6 text-secondary" />}
          />
          <StatsCard
            title="Avg Performance"
            value="98.2%"
            subtitle="Team efficiency"
            trend="stable"
            trendValue="0.1%"
            icon={<BarChart3 className="w-6 h-6 text-primary" />}
          />
          <StatsCard
            title="Total Points"
            value="24.8K"
            subtitle="League points"
            trend="up"
            trendValue="+1.2K"
            icon={<Award className="w-6 h-6 text-accent" />}
            variant="accent"
          />
        </div>

        {/* Action Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatsCard
            title="Security Score"
            value="A+"
            subtitle="System protection"
            icon={<Shield className="w-6 h-6 text-secondary" />}
          />
          <StatsCard
            title="Response Time"
            value="1.2s"
            subtitle="Avg query time"
            trend="down"
            trendValue="-0.3s"
            icon={<Zap className="w-6 h-6 text-warning" />}
          />
          <StatsCard
            title="Uptime"
            value="99.9%"
            subtitle="Last 30 days"
            trend="stable"
            trendValue="0.0%"
            icon={<Clock className="w-6 h-6 text-primary" />}
          />
        </div>

        {/* Leadership Leaderboard */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Leadership Rankings</h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="w-4 h-4" />
              <span>Updated 2 minutes ago</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {mockLeaders.map((leader) => (
              <LeaderCard
                key={leader.rank}
                {...leader}
                isTopThree={leader.rank <= 3}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;