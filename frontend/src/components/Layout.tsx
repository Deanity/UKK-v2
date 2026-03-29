import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Bell, LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout, isAuthenticated, isLoading } = useAuth();

  // Tunggu sampai restore token dari localStorage selesai
  // agar tidak redirect ke /login secara prematur saat page refresh
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const roleLabel: Record<string, string> = {
    admin: "Administrator",
    guru: "Guru",
    bk: "Guru BK",
    siswa: "Siswa",
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Header */}
          <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 sticky top-0 z-30">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <div className="hidden sm:block text-sm text-muted-foreground">
                Sistem Poin Pelanggaran Siswa
              </div>
            </div>
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 text-sm">
                    <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-semibold">
                      {user.nama.charAt(0)}
                    </div>
                    <div className="hidden sm:flex flex-col items-start">
                      <span className="font-medium text-xs">{user.nama}</span>
                      <span className="text-[10px] text-muted-foreground">{roleLabel[user.role]}</span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={logout} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Keluar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          {/* Main Content */}
          <main className="flex-1 p-4 md:p-6 overflow-auto animate-fade-in">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
