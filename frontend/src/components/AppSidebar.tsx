import {
  LayoutDashboard,
  Users,
  UserCog,
  AlertTriangle,
  FileText,
  ClipboardList,
  Printer,
  PenLine,
  User,
  GraduationCap,
  MessageSquareWarning,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";

const menuByRole: Record<string, { title: string; url: string; icon: any }[]> = {
  admin: [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Input Pelanggaran", url: "/guru/input", icon: PenLine },
    { title: "Data Siswa", url: "/admin/students", icon: Users },
    { title: "Data Guru", url: "/admin/teachers", icon: UserCog },
    { title: "Jenis Pelanggaran", url: "/admin/violation-types", icon: AlertTriangle },
    { title: "Cetak Surat", url: "/admin/letters", icon: FileText },
    { title: "Laporan", url: "/admin/reports", icon: MessageSquareWarning },
  ],
  bk: [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Pelanggaran Siswa", url: "/bk/violations", icon: ClipboardList },
    { title: "Cetak Surat", url: "/bk/letters", icon: Printer },
  ],
  guru: [
    // { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Input Pelanggaran", url: "/guru/input", icon: PenLine },
  ],
  siswa: [
    // { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Profil Saya", url: "/siswa/profile", icon: User },
  ],
};

export function AppSidebar() {
  const { user } = useAuth();
  if (!user) return null;

  const items = menuByRole[user.role] || [];

  return (
    <Sidebar className="border-r-0">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <GraduationCap className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-sm text-sidebar-foreground">SMK TI Bali Global</span>
            <span className="text-[10px] text-sidebar-foreground/60">Sistem Poin Pelanggaran</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] uppercase tracking-widest">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/dashboard"}
                      className="hover:bg-sidebar-accent/50 rounded-lg transition-colors"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <item.icon className="mr-3 h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
