import { useState, useEffect, useCallback } from "react";
import { Switch, Route, useLocation, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Files from "@/pages/Files";
import Talk from "@/pages/Talk";
import Calendar from "@/pages/Calendar";
import Notes from "@/pages/Notes";
import Contacts from "@/pages/Contacts";
import Deck from "@/pages/Deck";
import Mail from "@/pages/Mail";
import Activity from "@/pages/Activity";
import Media from "@/pages/Media";
import Settings from "@/pages/Settings";

// ─── Theme ──────────────────────────────────────────────────
function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const stored = localStorage.getItem("cloudspace-theme");
    if (stored === "dark" || stored === "light") return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    localStorage.setItem("cloudspace-theme", theme);
  }, [theme]);

  return { theme, setTheme };
}

// ─── Query Client ───────────────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: 1,
    },
  },
});

// ─── App Shell ──────────────────────────────────────────────
function AppShell() {
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(window.innerWidth < 1024);

  const handleResize = useCallback(() => {
    if (window.innerWidth < 768) {
      setCollapsed(true);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  const toggleSidebar = useCallback(() => {
    setCollapsed((prev) => !prev);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar collapsed={collapsed} onToggle={toggleSidebar} />
      <div
        className="flex flex-1 flex-col transition-all duration-200"
        style={{ marginLeft: collapsed ? 60 : 240 }}
      >
        <TopBar sidebarCollapsed={collapsed} />
        <main className="flex-1 overflow-auto pt-14">
          <div key={location} className="h-full animate-fade-in">
            <Switch>
              <Route path="/">{() => <Dashboard />}</Route>
              <Route path="/files">{() => <Files />}</Route>
              <Route path="/talk">{() => <Talk />}</Route>
              <Route path="/calendar">{() => <Calendar />}</Route>
              <Route path="/notes">{() => <Notes />}</Route>
              <Route path="/contacts">{() => <Contacts />}</Route>
              <Route path="/deck">{() => <Deck />}</Route>
              <Route path="/mail">{() => <Mail />}</Route>
              <Route path="/activity">{() => <Activity />}</Route>
              <Route path="/media">{() => <Media />}</Route>
              <Route path="/settings">{() => <Settings />}</Route>
            </Switch>
          </div>
        </main>
      </div>
    </div>
  );
}

// ─── Root App ───────────────────────────────────────────────
export default function App() {
  useTheme();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router hook={useHashLocation}>
          <Switch>
            <Route path="/login">{() => <Login />}</Route>
            <Route>{() => <AppShell />}</Route>
          </Switch>
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
