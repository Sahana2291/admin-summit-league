import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: "up" | "down" | "stable";
  trendValue?: string;
  icon: React.ReactNode;
  variant?: "default" | "primary" | "accent";
}

const getTrendIcon = (trend: "up" | "down" | "stable") => {
  if (trend === "up") return <TrendingUp className="w-4 h-4 text-secondary" />;
  if (trend === "down") return <TrendingDown className="w-4 h-4 text-destructive" />;
  return <Minus className="w-4 h-4 text-muted-foreground" />;
};

const getCardStyles = (variant: string) => {
  switch (variant) {
    case "primary":
      return "bg-gradient-primary text-primary-foreground shadow-glow";
    case "accent":
      return "bg-gradient-accent text-accent-foreground shadow-elevated";
    default:
      return "bg-gradient-card shadow-card";
  }
};

export function StatsCard({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  icon,
  variant = "default"
}: StatsCardProps) {
  return (
    <Card className={cn(
      "p-6 transition-all duration-300 hover:scale-105 animate-slide-up border-border/50",
      getCardStyles(variant)
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className={cn(
            "text-sm font-medium",
            variant === "default" ? "text-muted-foreground" : "text-current/70"
          )}>
            {title}
          </p>
          <div>
            <p className={cn(
              "text-3xl font-bold",
              variant === "default" ? "text-foreground" : "text-current"
            )}>
              {typeof value === "number" ? value.toLocaleString() : value}
            </p>
            {subtitle && (
              <p className={cn(
                "text-sm",
                variant === "default" ? "text-muted-foreground" : "text-current/70"
              )}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
        
        <div className={cn(
          "p-3 rounded-lg",
          variant === "default" ? "bg-primary/10" : "bg-black/10"
        )}>
          {icon}
        </div>
      </div>

      {trend && trendValue && (
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/20">
          {getTrendIcon(trend)}
          <span className={cn(
            "text-sm font-medium",
            trend === "up" ? "text-secondary" :
            trend === "down" ? "text-destructive" : "text-muted-foreground"
          )}>
            {trendValue}
          </span>
          <span className={cn(
            "text-sm",
            variant === "default" ? "text-muted-foreground" : "text-current/70"
          )}>
            vs last month
          </span>
        </div>
      )}
    </Card>
  );
}