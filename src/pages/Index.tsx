// Simple test to ensure the page loads properly
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Users, Target, Award } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">
            Super Admin Leadership League
          </h1>
          <p className="text-muted-foreground">Elite performance tracking & competitive rankings</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-gradient-primary text-primary-foreground">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">Total Leaders</p>
                <p className="text-2xl font-bold">12</p>
              </div>
              <Users className="w-8 h-8 opacity-80" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Goals Completed</p>
                <p className="text-2xl font-bold text-secondary">156</p>
              </div>
              <Target className="w-8 h-8 text-secondary" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Performance</p>
                <p className="text-2xl font-bold text-primary">98.2%</p>
              </div>
              <Trophy className="w-8 h-8 text-primary" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-accent text-accent-foreground">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">Total Points</p>
                <p className="text-2xl font-bold">24.8K</p>
              </div>
              <Award className="w-8 h-8 opacity-80" />
            </div>
          </Card>
        </div>

        {/* Leadership Board */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-6">Leadership Rankings</h2>
          
          <div className="space-y-4">
            {[
              { rank: 1, name: "Sarah Chen", title: "VP Engineering", points: 2847 },
              { rank: 2, name: "Marcus Rodriguez", title: "Head of Operations", points: 2634 },
              { rank: 3, name: "Emily Watson", title: "Director of Sales", points: 2512 }
            ].map((leader) => (
              <div key={leader.rank} className="flex items-center justify-between p-4 rounded-lg bg-card-elevated">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    {leader.rank}
                  </div>
                  <div>
                    <h3 className="font-semibold">{leader.name}</h3>
                    <p className="text-sm text-muted-foreground">{leader.title}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">{leader.points.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">points</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <Button variant="champion">
              <Trophy className="w-4 h-4 mr-2" />
              View Full Rankings
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Index;