import { Home, Briefcase, Heart, MessageCircle, User, LogOut, Users, FileText, CreditCard } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import logoImage from "@assets/Mijnzorgmatch (1000 x 600 px)_1761703998925.png";

export function AppSidebar() {
  const { user } = useAuth();
  const [location] = useLocation();

  const getMenuItems = () => {
    if (user?.role === "zzper") {
      return [
        { title: "Dashboard", url: "/", icon: Home },
        { title: "Mijn Profiel", url: "/profile", icon: User },
        { title: "Advertenties", url: "/vacancies", icon: Briefcase },
        { title: "Mijn Reacties", url: "/my-applications", icon: FileText },
        { title: "Credits & Abonnement", url: "/credits", icon: CreditCard },
        { title: "Berichten", url: "/messages", icon: MessageCircle },
      ];
    } else if (user?.role === "organisatie") {
      return [
        { title: "Dashboard", url: "/", icon: Home },
        { title: "Mijn Advertenties", url: "/my-vacancies", icon: Briefcase },
        { title: "Reacties", url: "/applications", icon: FileText },
        { title: "Berichten", url: "/messages", icon: MessageCircle },
      ];
    }
    return [];
  };

  const menuItems = getMenuItems();

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  return (
    <Sidebar>
      <SidebarContent>
        <div className="p-4 pb-2">
          <div className="flex items-center justify-center">
            <img src={logoImage} alt="MijnZorgMatch.nl" className="h-12 w-auto" />
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url}>
                    <a href={item.url} data-testid={`link-${item.url.slice(1) || 'dashboard'}`}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="p-4 space-y-2">
          <div className="flex items-center gap-3 px-2 py-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.profileImageUrl || undefined} alt={user?.firstName || "User"} />
              <AvatarFallback className="text-xs">{getUserInitials()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user?.firstName && user?.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : user?.email}
              </p>
              <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={async () => {
              try {
                await fetch("/api/logout", { method: "POST", credentials: "include" });
                window.location.href = "/";
              } catch (error) {
                console.error("Logout failed:", error);
                window.location.href = "/";
              }
            }}
            className="w-full flex items-center gap-2 px-2 py-2 text-sm rounded-md hover-elevate active-elevate-2"
            data-testid="button-logout"
          >
            <LogOut className="h-4 w-4" />
            <span>Uitloggen</span>
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
