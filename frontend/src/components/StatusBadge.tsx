import { Badge } from "@/components/ui/badge";
import { Student, getStatusLabel } from "@/data/dummy";

interface StatusBadgeProps {
  status: Student["status"];
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const variants: Record<string, string> = {
    safe: "bg-success/10 text-success border-success/20 hover:bg-success/20",
    warning: "bg-warning/10 text-warning border-warning/20 hover:bg-warning/20",
    critical: "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20",
  };

  return (
    <Badge variant="outline" className={variants[status]}>
      {getStatusLabel(status)}
    </Badge>
  );
}
