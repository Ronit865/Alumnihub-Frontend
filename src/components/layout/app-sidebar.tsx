import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Briefcase,
  DollarSign,
  BarChart3,
  MessageSquare,
  Settings,
  Sun,
  Moon,
  GraduationCap
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const navigation = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Alumni Directory", url: "/alumni", icon: Users },
  { title: "Events", url: "/events", icon: Calendar },
  { title: "Jobs & Mentorship", url: "/jobs", icon: Briefcase },
  { title: "Donations", url: "/donations", icon: DollarSign },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Communications", url: "/communications", icon: MessageSquare },
];

const bottomNavigation = [
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const location = useLocation();
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const getNavClasses = (path: string) => {
    const baseClasses = "sidebar-nav-item w-full justify-start gap-3 h-11 px-3 font-medium";
    return isActive(path) 
      ? `${baseClasses} active bg-primary text-primary-foreground` 
      : `${baseClasses} text-muted-foreground hover:text-foreground hover:bg-accent`;
  };

  return (
    <Sidebar className="border-r" collapsible="icon">
      <SidebarContent className="p-0">
        {/* Logo Section */}
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-primary-foreground" />
            </div>
            {open && (
              <div>
                <h1 className="font-bold text-lg gradient-text">AlumniHub</h1>
                <p className="text-sm text-muted-foreground">Management System</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Navigation */}
        <SidebarGroup className="px-3">
          <SidebarGroupLabel className={!open ? "sr-only" : ""}>
            Main Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavClasses(item.url)}>
                      <item.icon className="w-5 h-5 shrink-0" />
                      {open && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Bottom Section */}
        <div className="mt-auto p-3 border-t">
          <SidebarMenu className="space-y-1">
            {bottomNavigation.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <NavLink to={item.url} className={getNavClasses(item.url)}>
                    <item.icon className="w-5 h-5 shrink-0" />
                    {open && <span>{item.title}</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
            
            {/* Theme Toggle */}
            <SidebarMenuItem>
              <Button
                variant="ghost"
                size={!open ? "icon" : "default"}
                onClick={toggleTheme}
                className={`${!open ? "w-11 h-11" : "w-full justify-start gap-3 h-11"} text-muted-foreground hover:text-foreground hover:bg-accent`}
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                {open && <span>{isDark ? "Light Mode" : "Dark Mode"}</span>}
              </Button>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}