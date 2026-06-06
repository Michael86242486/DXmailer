import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Activity, Inbox, Settings, Webhook, Server, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

const navItems = [
  { icon: Activity, label: "Overview", href: "/console" },
  { icon: Inbox, label: "Delivery Logs", href: "/console/logs" },
  { icon: Server, label: "SMTP Pool", href: "/console/smtp" },
  { icon: Webhook, label: "Webhooks", href: "/console/webhooks" },
  { icon: Settings, label: "Settings", href: "/console/settings" },
];

export function ConsoleLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { setApiKey } = useAuth();

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col hidden md:flex shrink-0">
        <div className="p-6 border-b border-border flex items-center gap-2 text-primary">
          <Activity className="h-6 w-6" />
          <span className="font-mono font-bold tracking-wider">ORACLEX_</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-border">
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-foreground"
            onClick={() => setApiKey(null)}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Disconnect
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="h-14 border-b border-border bg-card flex items-center px-4 md:hidden shrink-0">
          <div className="flex items-center gap-2 text-primary font-mono font-bold">
            <Activity className="h-5 w-5" />
            ORACLEX_
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6 md:p-8">
          <div className="max-w-6xl mx-auto space-y-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
