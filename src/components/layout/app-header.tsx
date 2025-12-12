import { Search, Bell, User, LogOut, MessageCircle, Calendar, Heart, UserPlus, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { authService, notificationService } from "@/services/ApiServices";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

export function AppHeader() {
  const { user, admin, logout, userType, isLoading, isInitialized } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await notificationService.getNotifications({
          page: 1,
          limit: 10
        });
        
        if (response.success && response.data) {
          setNotifications(response.data.notifications || []);
          setUnreadCount(response.data.unreadCount || 0);
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };

    if (isInitialized && (user || admin)) {
      fetchNotifications();
      
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [isInitialized, user, admin]);

  // Handle notification click
  const handleNotificationClick = async (notification: any) => {
    try {
      if (!notification.read) {
        await notificationService.markAsRead(notification._id);
        setUnreadCount(prev => Math.max(0, prev - 1));
        setNotifications(prev =>
          prev.map(n => n._id === notification._id ? { ...n, read: true } : n)
        );
      }

      setNotificationsOpen(false);

      // Navigate based on notification type
      if (notification.type === 'connection') {
        navigate('/connections');
      } else if (notification.type === 'message') {
        navigate('/messages');
      } else if (notification.postId) {
        navigate(`/communications/post/${notification.postId}`);
      } else if (notification.type === 'event') {
        navigate('/events');
      } else if (notification.type === 'donation') {
        navigate('/donations');
      }
    } catch (error) {
      console.error("Failed to handle notification:", error);
    }
  };

  // Get notification icon
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'connection':
        return <UserPlus className="w-4 h-4 text-primary" />;
      case 'message':
        return <MessageCircle className="w-4 h-4 text-purple-500" />;
      case 'reply':
      case 'comment':
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case 'event':
        return <Calendar className="w-4 h-4 text-green-500" />;
      case 'donation':
        return <Heart className="w-4 h-4 text-red-500" />;
      default:
        return <Bell className="w-4 h-4 text-muted-foreground" />;
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      logout();
      toast({
        title: "Logged out successfully",
        description: "See you next time!",
        variant: "info",
      });
      navigate('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout failed",
        description: "An error occurred during logout",
        variant: "destructive",
      });
      logout();
      navigate('/auth/login');
    }
  };

  // Get current user data (either user or admin)
  const currentUser = user || admin;
  const displayName = currentUser?.name || 'Guest';
  const displayEmail = currentUser?.email || 'No email';
  const avatarSrc = currentUser?.avatar || '';
  const avatarFallback = displayName && displayName !== 'Guest' 
    ? displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) 
    : 'U';

  // Show loading state only if not initialized AND we don't have any user data
  if (!isInitialized && !currentUser) {
    return (
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 border-l-0">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="md:hidden" />
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-muted animate-pulse"></div>
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
          <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-8 w-8 sm:h-10 sm:w-10">
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-[10px] sm:text-xs text-primary-foreground font-medium">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 sm:w-96 p-0">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-semibold">Notifications</h3>
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {unreadCount} new
                  </Badge>
                )}
              </div>
              <ScrollArea className="h-[400px]">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Bell className="w-12 h-12 text-muted-foreground/30 mb-3" />
                    <p className="text-sm text-muted-foreground">No notifications yet</p>
                  </div>
                ) : (
                  <div className="p-2">
                    {notifications.map((notification) => (
                      <div
                        key={notification._id}
                        className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-accent ${
                          !notification.read ? 'bg-primary/5' : ''
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-sm ${!notification.read ? 'font-medium' : ''}`}>
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1"></div>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatTimestamp(notification.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
              {notifications.length > 0 && (
                <div className="p-2 border-t">
                  <Button
                    variant="ghost"
                    className="w-full text-sm"
                    onClick={() => {
                      setNotificationsOpen(false);
                      navigate('/communications?tab=notifications');
                    }}
                  >
                    View all notifications
                  </Button>
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 sm:h-10 sm:w-10 rounded-full">
                <div className="relative">
                  <Avatar className="h-8 w-8 sm:h-10 sm:w-10 ring-2 ring-primary/20">
                    <AvatarImage src={avatarSrc} alt="Profile" />
                    <AvatarFallback className="bg-primary text-primary-foreground font-medium text-xs sm:text-sm">
                      {avatarFallback}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 border-2 border-background rounded-full"></div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {displayName}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {displayEmail}
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