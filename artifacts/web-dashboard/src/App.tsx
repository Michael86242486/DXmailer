import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import LandingPage from "@/pages/landing";
import Dashboard from "@/pages/console/dashboard";
import LogsPage from "@/pages/console/logs";
import SmtpPage from "@/pages/console/smtp";
import WebhooksPage from "@/pages/console/webhooks";
import SettingsPage from "@/pages/console/settings";
import NotFound from "@/pages/not-found";
import { ConsoleLayout } from "@/components/layout/ConsoleLayout";
import { AuthGuard } from "@/components/layout/AuthGuard";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ConsoleRoutes() {
  return (
    <AuthGuard>
      <ConsoleLayout>
        <Switch>
          <Route path="/console" component={Dashboard} />
          <Route path="/console/logs" component={LogsPage} />
          <Route path="/console/smtp" component={SmtpPage} />
          <Route path="/console/webhooks" component={WebhooksPage} />
          <Route path="/console/settings" component={SettingsPage} />
          <Route component={NotFound} />
        </Switch>
      </ConsoleLayout>
    </AuthGuard>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Switch>
            <Route path="/" component={LandingPage} />
            <Route path="/console/*" component={ConsoleRoutes} />
            <Route path="/console" component={ConsoleRoutes} />
            <Route component={NotFound} />
          </Switch>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
