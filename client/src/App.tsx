import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Register from "@/pages/Register";
import Login from "@/pages/Login";
import RoleSelection from "@/pages/RoleSelection";
import ZzperDashboard from "@/pages/ZzperDashboard";
import OrganisatieDashboard from "@/pages/OrganisatieDashboard";
import ProfileForm from "@/pages/ProfileForm";
import VacancyForm from "@/pages/VacancyForm";
import Messages from "@/pages/Messages";
import Credits from "@/pages/Credits";
import { Skeleton } from "@/components/ui/skeleton";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/register" component={Register} />
        <Route path="/login" component={Login} />
        <Route component={Landing} />
      </Switch>
    );
  }

  // User is authenticated but hasn't selected a role
  if (!user?.role) {
    return (
      <Switch>
        <Route path="/" component={RoleSelection} />
        <Route component={RoleSelection} />
      </Switch>
    );
  }

  // User has selected a role - show appropriate dashboard
  const getDashboardComponent = () => {
    if (user.role === "zzper") return ZzperDashboard;
    if (user.role === "organisatie") return OrganisatieDashboard;
    return ZzperDashboard;
  };

  const DashboardComponent = getDashboardComponent();

  return (
    <Switch>
      <Route path="/" component={DashboardComponent} />
      {user.role === "zzper" && (
        <>
          <Route path="/profile" component={ProfileForm} />
          <Route path="/vacancies" component={Messages} />
          <Route path="/my-applications" component={Messages} />
          <Route path="/credits" component={Credits} />
        </>
      )}
      {user.role === "organisatie" && (
        <>
          <Route path="/my-vacancies" component={Messages} />
          <Route path="/my-vacancies/new" component={VacancyForm} />
          <Route path="/applications" component={Messages} />
        </>
      )}
      <Route path="/messages" component={Messages} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const showSidebar = isAuthenticated && !isLoading && user?.role;

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <>
      {showSidebar ? (
        <SidebarProvider style={style as React.CSSProperties}>
          <div className="flex h-screen w-full">
            <AppSidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
              <header className="flex items-center justify-between p-4 border-b bg-background">
                <SidebarTrigger data-testid="button-sidebar-toggle" />
                <ThemeToggle />
              </header>
              <main className="flex-1 overflow-auto">
                <div className="container mx-auto px-4 py-8 max-w-7xl">
                  <Router />
                </div>
              </main>
            </div>
          </div>
        </SidebarProvider>
      ) : (
        <Router />
      )}
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppContent />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
