import { useLocation } from "wouter";
import { Bell, Settings, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/files": "Files",
  "/talk": "Talk",
  "/calendar": "Calendar",
  "/notes": "Notes",
  "/contacts": "Contacts",
  "/deck": "Deck",
  "/mail": "Mail",
  "/activity": "Activity",
  "/media": "Media",
  "/settings": "Settings",
};

interface TopBarProps {
  sidebarCollapsed: boolean;
}

export function TopBar({ sidebarCollapsed }: TopBarProps) {
  const [location] = useLocation();
  const title = pageTitles[location] || "CloudSpace";

  return (
    <header
      className={cn(
        "fixed top-0 z-20 flex h-14 items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-200",
        sidebarCollapsed ? "left-[60px]" : "left-[240px]",
        "right-0"
      )}
    >
      {/* Left — page title */}
      <div className="flex items-center px-6">
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>

      {/* Center — search */}
      <div className="flex flex-1 justify-center px-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search CloudSpace…"
            className="h-9 pl-9 pr-16 bg-muted/50 border-transparent focus-visible:border-input"
          />
          <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>
      </div>

      {/* Right — actions */}
      <div className="flex items-center gap-1 px-4">
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-4 w-4" />
          <Badge className="absolute -right-0.5 -top-0.5 h-4 w-4 items-center justify-center p-0 text-[10px]">
            3
          </Badge>
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Settings className="h-4 w-4" />
        </Button>
        <div className="ml-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
          PS
        </div>
      </div>
    </header>
  );
}
