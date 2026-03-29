import { FileX } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export function EmptyState({ title = "Tidak Ada Data", description = "Belum ada data yang tersedia." }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <FileX className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm">{description}</p>
    </div>
  );
}
