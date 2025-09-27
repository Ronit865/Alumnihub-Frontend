import { Search, Bell, User, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { AdminToggle } from "./admin-toggle";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/ApiServices";
import { useNavigate } from "react-router-dom";

export function AppHeader() {
  const { user, admin, logout, userType, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      logout();
      navigate('/auth/login');
    }
  };

  // Get current user data (either user or admin)
  const currentUser = user || admin;
  const displayName = currentUser?.name || '';
  const displayEmail = currentUser?.email || '';
  const avatarSrc = currentUser?.avatar || '';
  const avatarFallback = displayName ? displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U';

  // Show loading state if still fetching user data
  if (isLoading) {
    return (
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 border-l-0">
        <div className="flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4 md:px-6">
          <div className="flex items-center gap-2 sm:gap-4 flex-1">
            <SidebarTrigger className="p-2" />
            <div className="hidden md:block">
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
            <div className="h-8 w-8 sm:h-10 sm:w-10 bg-muted rounded-full animate-pulse" />
            <div className="h-8 w-8 sm:h-10 sm:w-10 bg-muted rounded-full animate-pulse" />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 border-l-0">
      <div className="flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4 md:px-6">
        <div className="flex items-center gap-2 sm:gap-4 flex-1">
          <SidebarTrigger className="p-2" />
          <div className="hidden md:block">
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
          <Button variant="ghost" size="icon" className="relative h-8 w-8 sm:h-10 sm:w-10">
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-primary rounded-full flex items-center justify-center">
              <span className="text-[8px] sm:text-[10px] text-primary-foreground font-medium">3</span>
            </span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 sm:h-10 sm:w-10 rounded-full">
                <Avatar className="h-8 w-8 sm:h-10 sm:w-10 ring-2 ring-primary/20">
                  <AvatarImage src={avatarSrc} alt="Profile" />
                  <AvatarFallback className="bg-primary text-primary-foreground font-medium text-xs sm:text-sm">
                    {avatarFallback}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {displayName || 'Guest'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {displayEmail || 'No email'}
                  </p>
                  {userType === 'admin' && (
                    <p className="text-xs leading-none text-primary font-medium">
                      Administrator
                    </p>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate(userType === 'admin' ? '/admin/settings' : '/settings')}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive cursor-pointer"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}