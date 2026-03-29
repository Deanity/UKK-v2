import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  variant?: "default" | "primary" | "warning" | "destructive" | "success";
}

const variantStyles: Record<string, string> = {
  default: "bg-card",
  primary: "bg-primary/5 border-primary/20",
  warning: "bg-warning/5 border-warning/20",
  destructive: "bg-destructive/5 border-destructive/20",
  success: "bg-success/5 border-success/20",
};

const iconStyles: Record<string, string> = {
  default: "bg-secondary text-secondary-foreground",
  primary: "bg-primary/10 text-primary",
  warning: "bg-warning/10 text-warning",
  destructive: "bg-destructive/10 text-destructive",
  success: "bg-success/10 text-success",
};

export function StatCard({ title, value, icon: Icon, trend, variant = "default" }: StatCardProps) {
  return (
    <div className={`stat-card ${variantStyles[variant]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold font-display mt-1">{value}</p>
          {trend && <p className="text-xs text-muted-foreground mt-1">{trend}</p>}
        </div>
        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${iconStyles[variant]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
