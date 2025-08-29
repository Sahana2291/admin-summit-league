// src/pages/Login.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Shield, Trophy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import leadershipTrophy from "@/assets/leadership-trophy.jpg";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/app/store";

export function Login() {
  const [email, setEmail] = useState("admin@leadershipleague.com");
  const [password, setPassword] = useState("admin123");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();
  const { isAuthenticated } = useAuthStore();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login({ email, password });
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <img
              src={leadershipTrophy}
              alt="Leadership Trophy"
              className="w-20 h-20 object-cover rounded-full shadow-glow"
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Admin Panel
            </h1>
            <p className="text-muted-foreground">Leadership League Management</p>
          </div>
        </div>

        {/* Login Form */}
        <Card className="bg-gradient-card shadow-elevated border-border/50">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Secure Access
            </CardTitle>
            <CardDescription>
              Enter your admin credentials to access the management dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Admin Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@leadershipleague.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-card-elevated border-border/50 focus:border-primary/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-card-elevated border-border/50 focus:border-primary/50"
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                variant="champion"
                disabled={isLoading}
              >
                {isLoading ? "Authenticating..." : "Access Admin Panel"}
                <Trophy className="w-4 h-4 ml-2" />
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Protected by enterprise-grade security
          </p>
        </div>
      </div>
    </div>
  );
}