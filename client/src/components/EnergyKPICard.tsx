import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

type TrendDirection = "up" | "down" | "neutral";

interface EnergyKPICardProps {
  title: string;
  value: string;
  unit: string;
  trend?: {
    value: number;
    direction: TrendDirection;
  };
  status?: "normal" | "warning" | "critical";
  icon?: React.ReactNode;
}

const getTrendIcon = (direction: TrendDirection) => {
  switch (direction) {
    case "up":
      return <TrendingUp className="h-3 w-3" />;
    case "down":
      return <TrendingDown className="h-3 w-3" />;
    default:
      return <Minus className="h-3 w-3" />;
  }
};

const getStatusColor = (status: "normal" | "warning" | "critical") => {
  switch (status) {
    case "warning":
      return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
    case "critical":
      return "bg-red-500/20 text-red-300 border-red-500/30";
    default:
      return "bg-primary/20 text-primary border-primary/30";
  }
};

export function EnergyKPICard({
  title,
  value,
  unit,
  trend,
  status = "normal",
  icon,
}: EnergyKPICardProps) {
  return (
    <Card className="hover-elevate transition-all duration-200" data-testid={`card-kpi-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && (
          <div className="text-muted-foreground">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline space-x-2">
          <div className="text-2xl font-bold font-roboto">
            {value}
          </div>
          <span className="text-sm text-muted-foreground">{unit}</span>
        </div>
        {trend && (
          <div className="flex items-center space-x-2 mt-2">
            <Badge
              variant="outline"
              className={cn(
                "text-xs flex items-center space-x-1",
                getStatusColor(status)
              )}
            >
              {getTrendIcon(trend.direction)}
              <span>{Math.abs(trend.value)}%</span>
            </Badge>
            <span className="text-xs text-muted-foreground">
              vs. last hour
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}