import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, AlertTriangle, Clock, Info, Zap } from "lucide-react";

export type UrgencyLevel = "low" | "medium" | "high" | "urgent" | "critical";

interface UrgencyBadgeProps {
  level: UrgencyLevel;
  className?: string;
  showIcon?: boolean;
}

const urgencyConfig = {
  low: {
    label: "Low Priority",
    color: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
    icon: Info
  },
  medium: {
    label: "Medium Priority",
    color: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
    icon: Clock
  },
  high: {
    label: "High Priority",
    color: "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800",
    icon: AlertTriangle
  },
  urgent: {
    label: "Urgent",
    color: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800",
    icon: Zap
  },
  critical: {
    label: "Critical",
    color: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800 animate-pulse",
    icon: AlertCircle
  }
};

export function UrgencyBadge({ level, className, showIcon = true }: UrgencyBadgeProps) {
  const config = urgencyConfig[level];
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={cn("gap-1.5 px-2.5 py-0.5 transition-all font-medium border", config.color, className)}>
      {showIcon && <Icon className="w-3.5 h-3.5" />}
      {config.label}
    </Badge>
  );
}