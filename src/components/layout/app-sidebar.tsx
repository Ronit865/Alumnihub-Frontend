import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Briefcase,
  Heart,
  MessageCircle,
  MessageSquare,
  Settings,
  Sun,
  Moon,
  GraduationCap,
  BarChart3,
  Mail,
  Plus
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
import { useAuth } from "@/context/AuthContext";

// Base navigation for all users
const baseNavigation = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Alumni Directory", url: "/alumni", icon: Users },
  { title: "Events", url: "/events", icon: Calendar },
  { title: "Donations", url: "/donations", icon: Heart },
  { title: "Personal Messages", url: "/messages", icon: MessageCircle },
  { title: "Communications", url: "/communications", icon: MessageSquare },
];

// Student-specific navigation
const studentNavigation = [
  { title: "Jobs & Mentorship", url: "/jobs", icon: Briefcase },
];

// Alumni-specific navigation
const alumniNavigation = [
  { title: "Post Job", url: "/jobs/post", icon: Plus },
];

const adminNavigation = [
  { title: "Admin Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Manage Users", url: "/admin/alumni", icon: Users },
  { title: "Manage Events", url: "/admin/events", icon: Calendar },
  { title: "Manage Jobs", url: "/admin/jobs", icon: Briefcase },
  { title: "Manage Donations", url: "/admin/donations", icon: Heart },
  { title: "Communications", url: "/admin/communications", icon: Mail },
  { title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const location = useLocation();
  const { user, userType } = useAuth();
  
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme) {
        return savedTheme === "dark";
      }
      return document.documentElement.classList.contains("dark");
    }
    return false;
  });

  // Determine if we're in admin mode
  const isAdminMode = location.pathname.startsWith('/admin');

  // Get navigation items based on role
  const getNavigationItems = () => {
    let navItems = [...baseNavigation];
    
    // Insert role-specific items after "Events" (at index 2)
    const insertIndex = 3; // After "Events"
    
    // Check user role from auth context first, then fall back to user.role
    const currentUserRole = user?.role || userType;
    
    if (currentUserRole === "student") {
      navItems.splice(insertIndex, 0, ...studentNavigation);
    } else if (currentUserRole === "alumni") {
      navItems.splice(insertIndex, 0, ...alumniNavigation);
    }
    
    return navItems;
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      const isDarkTheme = savedTheme === "dark";
      setIsDark(isDarkTheme);
      document.documentElement.classList.toggle("dark", isDarkTheme);
    } else {
      const isDarkMode = document.documentElement.classList.contains("dark");
      setIsDark(isDarkMode);
      localStorage.setItem("theme", isDarkMode ? "dark" : "light");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    document.documentElement.classList.toggle("dark", newTheme);
    localStorage.setItem("theme", newTheme ? "dark" : "light");
  };

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/" && !isAdminMode;
    }
    if (path === "/admin") {
      return location.pathname === "/admin" || location.pathname === "/admin/dashboard";
    }
    return location.pathname === path;
  };

  const getNavClasses = (path: string) => {
    const baseClasses = "sidebar-nav-item w-full justify-start gap-2 sm:gap-3 h-9 sm:h-11 px-2 sm:px-3 font-medium text-sm sm:text-base";
    const active = isActive(path);
    return active
      ? `${baseClasses} active bg-primary text-primary-foreground`
      : `${baseClasses} text-muted-foreground hover:text-foreground hover:bg-accent`;
  };

  return (
    <Sidebar className="border-r h-screen sticky top-0" collapsible="icon">
      <SidebarContent className="p-0 h-full">
        {/* Logo Section */}
        <div className={`border-b h-14 sm:h-16 flex items-center ${open ? "justify-center p-3 sm:p-4" : "justify-center p-1 sm:p-2"}`}>
          <div className={`flex items-center ${open ? "gap-3 sm:gap-4" : "justify-center"}`}>
            <div className={`flex items-center justify-center shrink-0 ${open ? "w-10 h-10 sm:w-12 sm:h-12" : "w-7 h-7 sm:w-8 sm:h-8"}`}>
              <img
                src="/ANlogo.png"
                alt="AllyNet Logo"
                className="w-full h-full object-contain"
              />
            </div>
            {open && (
              <div className="min-w-0">
                <h1 className="font-bold text-lg sm:text-xl md:text-2xl gradient-text truncate">AllyNet</h1>
              </div>
            )}
          </div>
        </div>

        {/* Main Navigation */}
        <SidebarGroup className={open ? "px-2 sm:px-3" : "px-1 sm:px-2"}>
          <SidebarGroupLabel className={!open ? "sr-only" : "text-xs sm:text-sm"}>
            Main Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5 sm:space-y-1">
              {(isAdminMode ? adminNavigation : getNavigationItems()).map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url} className={getNavClasses(item.url)}>
                      <item.icon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                      {open && <span className="truncate text-sm sm:text-base">{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Bottom Section */}
        <div className={`mt-auto border-t ${open ? "p-2 sm:p-3" : "p-1 sm:p-2"}`}>
          <SidebarMenu className="space-y-0.5 sm:space-y-1">
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to={isAdminMode ? "/admin/settings" : "/settings"} className={getNavClasses(isAdminMode ? "/admin/settings" : "/settings")}>
                  <Settings className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                  {open && <span className="truncate text-sm sm:text-base">Settings</span>}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* Theme Toggle */}
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Button
                  variant="ghost"
                  size={!open ? "icon" : "default"}
                  onClick={toggleTheme}
                  className={`${!open ? "w-9 h-9 sm:w-11 sm:h-11 justify-center" : "w-full justify-start gap-2 sm:gap-3 h-9 sm:h-11"} text-muted-foreground hover:text-foreground hover:bg-accent`}
                >
                  {isDark ? <Sun className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />}
                  {open && <span className="truncate text-sm sm:text-base">{isDark ? "Light Mode" : "Dark Mode"}</span>}
                </Button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}