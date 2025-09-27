import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Info, X, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

type AlertType = "info" | "warning" | "critical" | "success" | "anomaly";

interface AlertBannerProps {
  type: AlertType;
  title: string;
  description: string;
  timestamp: string;
  onDismiss?: () => void;
  actionLabel?: string;
  onAction?: () => void;
}

const getAlertConfig = (type: AlertType) => {
  switch (type) {
    case "critical":
      return {
        icon: AlertTriangle,
        className: "border-red-500/50 bg-red-500/10 text-red-300",
        badgeClassName: "bg-red-500/20 text-red-300 border-red-500/30",
      };
    case "warning":
      return {
        icon: AlertTriangle,
        className: "border-yellow-500/50 bg-yellow-500/10 text-yellow-300",
        badgeClassName: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
      };
    case "success":
      return {
        icon: CheckCircle,
        className: "border-primary/50 bg-primary/10 text-primary",
        badgeClassName: "bg-primary/20 text-primary border-primary/30",
      };
    case "anomaly":
      return {
        icon: Zap,
        className: "border-purple-500/50 bg-purple-500/10 text-purple-300",
        badgeClassName: "bg-purple-500/20 text-purple-300 border-purple-500/30",
      };
    default:
      return {
        icon: Info,
        className: "border-blue-500/50 bg-blue-500/10 text-blue-300",
        badgeClassName: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      };
  }
};

export function AlertBanner({
  type,
  title,
  description,
  timestamp,
  onDismiss,
  actionLabel,
  onAction,
}: AlertBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const config = getAlertConfig(type);
  const Icon = config.icon;

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
    console.log(`Alert dismissed: ${title}`);
  };

  const handleAction = () => {
    onAction?.();
    console.log(`Alert action triggered: ${actionLabel}`);
  };

  if (!isVisible) return null;

  return (
    <Alert 
      className={cn(
        "transition-all duration-200 hover-elevate p-4",
        // 覆盖Alert组件的默认SVG定位样式
        "[&>svg]:!static [&>svg~*]:!pl-0 [&>svg+div]:!translate-y-0",
        config.className
      )}
      data-testid={`alert-${type}`}
    >
      <div className="flex items-start space-x-4">
        <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3 mb-2">
            <h4 className="font-semibold text-sm leading-none">{title}</h4>
            <Badge variant="outline" className={cn("text-xs px-2 py-1 leading-none", config.badgeClassName)}>
              {type.toUpperCase()}
            </Badge>
          </div>
          <AlertDescription className="text-sm opacity-90 leading-relaxed mb-2">
            {description}
          </AlertDescription>
          <div className="text-xs opacity-70 font-mono">{timestamp}</div>
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0 mt-0.5">
          {actionLabel && onAction && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAction}
              className="text-xs h-8 px-3"
              data-testid={`button-alert-action`}
            >
              {actionLabel}
            </Button>
          )}
          {onDismiss && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDismiss}
              className="h-8 w-8"
              data-testid="button-alert-dismiss"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
    </Alert>
  );
}