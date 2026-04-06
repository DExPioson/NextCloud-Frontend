import { useLocation, Link } from "wouter";
import {
  LayoutDashboard,
  FolderOpen,
  MessageSquare,
  CalendarDays,
  StickyNote,
  Users,
  Kanban,
  Mail,
  Activity,
  Image,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CloudSpaceLogo } from "./CloudSpaceLogo";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/" },
  { label: "Files", icon: FolderOpen, href: "/files" },
  { label: "Talk", icon: MessageSquare, href: "/talk" },
  { label: "Calendar", icon: CalendarDays, href: "/calendar" },
  { label: "Notes", icon: StickyNote, href: "/notes" },
  { label: "Contacts", icon: Users, href: "/contacts" },
  { label: "Deck", icon: Kanban, href: "/deck" },
  { label: "Mail", icon: Mail, href: "/mail" },
  { label: "Activity", icon: Activity, href: "/activity" },
  { label: "Media", icon: Image, href: "/media" },
  { label: "Settings", icon: Settings, href: "/settings" },
];

interface SidebarProps {
  collapsed: boolean;
}

export function Sidebar({ collapsed }: SidebarProps) {
  const [location] = useLocation();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-30 flex h-screen flex-col border-r bg-sidebar transition-all duration-200",
        collapsed ? "w-[60px]" : "w-[240px]"
      )}
      style={{ borderColor: "hsl(var(--sidebar-border))" }}
    >
      {/* Logo */}
      <div className={cn("flex h-14 items-center gap-2 border-b px-4", collapsed && "justify-center px-0")}>
        <CloudSpaceLogo size={28} />
        {!collapsed && <span className="text-base font-semibold text-foreground">CloudSpace</span>}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            const Icon = item.icon;

            const linkContent = (
              <Link
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  collapsed && "justify-center px-0"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );

            if (collapsed) {
              return (
                <li key={item.href}>
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                    <TooltipContent side="right">{item.label}</TooltipContent>
                  </Tooltip>
                </li>
              );
            }

            return <li key={item.href}>{linkContent}</li>;
          })}
        </ul>
      </nav>

      {/* User info */}
      <div className={cn("border-t p-3", collapsed && "flex justify-center p-2")}>
        <div className={cn("flex items-center gap-3", collapsed && "gap-0")}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            PS
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">Piyush Sharma</p>
              <p className="truncate text-xs text-muted-foreground">piyush@cloudspace.home</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
