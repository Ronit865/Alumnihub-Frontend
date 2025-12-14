import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Send, Users, MessageSquare, Bell, TrendingUp, Eye, Calendar, Briefcase } from "lucide-react";
import { emailService, adminService, notificationService, eventService, jobService } from "@/services/ApiServices";
import { toast } from "sonner";

export function Communications() {
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [emailForm, setEmailForm] = useState({
    subject: "",
    body: "",
    filter: ""
  });
  const [isSending, setIsSending] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    alumniCount: 0,
    studentCount: 0,
    donorCount: 0,
    messagesSent: 0
  });
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [recentJobs, setRecentJobs] = useState<any[]>([]);
  const [sendingEventEmail, setSendingEventEmail] = useState(false);
  const [sendingJobEmail, setSendingJobEmail] = useState(false);

  const handleSendEmail = async () => {
    if (!emailForm.subject || !emailForm.body || !emailForm.filter) {
      toast.error("Please fill in all fields and select recipients");
      return;
    }

    setIsSending(true);
    try {
      const response = await emailService.sendBulkEmails({
        subject: emailForm.subject,
        body: emailForm.body,
        filter: emailForm.filter
      });
      
      toast.success(response.message || "Emails sent successfully!");
      
      // Update messages sent count
      setStats(prev => ({ 
        ...prev, 
        messagesSent: prev.messagesSent + (response.data?.totalSent || 1)
      }));
      
      // Refresh notifications to show the email send activity
      fetchNotifications();
      
      // Reset form
      setEmailForm({
        subject: "",
        body: "",
        filter: ""
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to send emails");
    } finally {
      setIsSending(false);
    }
  };

  const handleRecipientSelect = (type: string) => {
    setEmailForm(prev => ({ ...prev, filter: type }));
  };

  const handleSendEventEmails = async () => {
    if (recentEvents.length === 0) {
      toast.error("No recent events to share");
      return;
    }

    try {
      setSendingEventEmail(true);
      
      // Create email content with all recent events
      const eventsList = recentEvents.map(event => 
        `<div style="margin-bottom: 20px; padding: 15px; background-color: #f9f9f9; border-left: 4px solid #667eea;">
          <h3 style="margin: 0 0 10px 0; color: #333;">${event.title}</h3>
          <p style="margin: 5px 0; color: #666;"><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
          <p style="margin: 5px 0; color: #666;"><strong>Location:</strong> ${event.location || 'TBA'}</p>
          <p style="margin: 10px 0 0 0; color: #555;">${event.description}</p>
        </div>`
      ).join('');

      const emailBody = `
        <h2 style="color: #333; margin-bottom: 20px;">Upcoming Events</h2>
        <p style="color: #666; margin-bottom: 20px;">Here are the latest events happening in our alumni network:</p>
        ${eventsList}
        <p style="margin-top: 30px; color: #666;">We look forward to seeing you there!</p>
      `;

      const response = await emailService.sendBulkEmails({
        subject: "Upcoming Events - Alumni Network",
        body: emailBody,
        filter: "all"
      });

      if (response.success) {
        toast.success("Event notifications sent successfully!");
        fetchNotifications();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to send event emails");
    } finally {
      setSendingEventEmail(false);
    }
  };

  const handleSendJobEmails = async () => {
    if (recentJobs.length === 0) {
      toast.error("No recent jobs to share");
      return;
    }

    try {
      setSendingJobEmail(true);
      
      // Create email content with all recent jobs
      const jobsList = recentJobs.map(job => 
        `<div style="margin-bottom: 20px; padding: 15px; background-color: #f9f9f9; border-left: 4px solid #667eea;">
          <h3 style="margin: 0 0 10px 0; color: #333;">${job.title}</h3>
          <p style="margin: 5px 0; color: #666;"><strong>Company:</strong> ${job.company}</p>
          <p style="margin: 5px 0; color: #666;"><strong>Location:</strong> ${job.location}</p>
          <p style="margin: 5px 0; color: #666;"><strong>Type:</strong> ${job.jobType}</p>
          <p style="margin: 5px 0; color: #666;"><strong>Experience:</strong> ${job.experienceRequired}</p>
          ${job.salary ? `<p style="margin: 5px 0; color: #666;"><strong>Salary:</strong> ₹${job.salary.toLocaleString()}</p>` : ''}
          <p style="margin: 10px 0 0 0; color: #555;">${job.description}</p>
        </div>`
      ).join('');

      const emailBody = `
        <h2 style="color: #333; margin-bottom: 20px;">New Job Opportunities</h2>
        <p style="color: #666; margin-bottom: 20px;">Check out these latest job opportunities from our alumni network:</p>
        ${jobsList}
        <p style="margin-top: 30px; color: #666;">Best of luck with your applications!</p>
      `;

      const response = await emailService.sendBulkEmails({
        subject: "New Job Opportunities - Alumni Network",
        body: emailBody,
        filter: "all"
      });

      if (response.success) {
        toast.success("Job notifications sent successfully!");
        fetchNotifications();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to send job emails");
    } finally {
      setSendingJobEmail(false);
    }
  };

  // Fetch notifications function (can be called to refresh)
  const fetchNotifications = async () => {
    try {
      setNotificationsLoading(true);
      const response = await notificationService.getNotifications({
        page: 1,
        limit: 20,
        // Filter for communication-related notifications only
        type: 'email,event,job,announcement'
      });
      
      if (response.success && response.data) {
        setNotifications(response.data.notifications || []);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setNotificationsLoading(false);
    }
  };

  // Fetch stats and notifications on component mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        // Fetch all users to calculate stats - using adminService for admin
        const usersResponse = await adminService.getAllUsers();
        
        if (usersResponse.success && usersResponse.data) {
          const users = usersResponse.data;
          
          // Calculate stats from users - using 'role' field instead of 'userType'
          const alumniCount = users.filter((u: any) => u.role?.toLowerCase() === 'alumni').length;
          const studentCount = users.filter((u: any) => u.role?.toLowerCase() === 'student').length;
          const donorCount = users.filter((u: any) => u.role?.toLowerCase() === 'donor').length;
          
          setStats({
            totalUsers: users.length,
            alumniCount,
            studentCount,
            donorCount,
            messagesSent: 0 // This would need email history from backend
          });
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchRecentEventsAndJobs = async () => {
      try {
        const [eventsRes, jobsRes] = await Promise.all([
          eventService.getEvents(),
          jobService.getAllJobs()
        ]);
        
        if (eventsRes.success && eventsRes.data) {
          // Get latest 5 events
          const events = eventsRes.data.slice(0, 5);
          setRecentEvents(events);
        }
        
        if (jobsRes.success && jobsRes.data) {
          // Get latest 5 jobs
          const jobs = jobsRes.data.slice(0, 5);
          setRecentJobs(jobs);
        }
      } catch (error) {
        console.error('Failed to fetch events/jobs:', error);
      }
    };

    fetchStats();
    fetchNotifications();
    fetchRecentEventsAndJobs();
  }, []);

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Communications</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
            Manage newsletters, announcements, and alumni communications.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 animate-slide-up">
        <div className="stats-card-pink">
          <div className="flex items-center justify-between">
            <div>
              <p className="stats-card-label">Total Users</p>
              <p className="stats-card-number">{loading ? '...' : stats.totalUsers.toLocaleString()}</p>
              <p className="text-xs text-white/80 flex items-center gap-1 mt-1">
                <Users className="w-3 h-3" />
                All registered users
              </p>
            </div>
            <Mail className="stats-card-icon" />
          </div>
        </div>
        
        <div className="stats-card-blue">
          <div className="flex items-center justify-between">
            <div>
              <p className="stats-card-label">Alumni</p>
              <p className="stats-card-number">{loading ? '...' : stats.alumniCount.toLocaleString()}</p>
              <p className="text-xs text-white/80 flex items-center gap-1 mt-1">
                <Users className="w-3 h-3" />
                Active alumni
              </p>
            </div>
            <Send className="stats-card-icon" />
          </div>
        </div>
        
        <div className="stats-card-teal">
          <div className="flex items-center justify-between">
            <div>
              <p className="stats-card-label">Students</p>
              <p className="stats-card-number">{loading ? '...' : stats.studentCount.toLocaleString()}</p>
              <p className="text-xs text-white/80 flex items-center gap-1 mt-1">
                <Users className="w-3 h-3" />
                Current students
              </p>
            </div>
            <Eye className="stats-card-icon" />
          </div>
        </div>
        
        <div className="stats-card-orange">
          <div className="flex items-center justify-between">
            <div>
              <p className="stats-card-label">Donors</p>
              <p className="stats-card-number">{loading ? '...' : stats.donorCount.toLocaleString()}</p>
              <p className="text-xs text-white/80 flex items-center gap-1 mt-1">
                <MessageSquare className="w-3 h-3" />
                Active donors
              </p>
            </div>
            <MessageSquare className="stats-card-icon" />
          </div>
        </div>
      </div>

      {/* Event & Job Email Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bento-card gradient-surface border-card-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Send Event Notifications
            </CardTitle>
            <CardDescription>
              Notify users about {recentEvents.length} recent event(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentEvents.length > 0 ? (
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  Latest events:
                  <ul className="mt-2 space-y-1 list-disc list-inside">
                    {recentEvents.slice(0, 3).map((event, idx) => (
                      <li key={idx} className="truncate">{event.title}</li>
                    ))}
                  </ul>
                </div>
                <Button 
                  className="w-full"
                  onClick={handleSendEventEmails}
                  disabled={sendingEventEmail}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {sendingEventEmail ? "Sending..." : "Send to All Users"}
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No recent events to share</p>
            )}
          </CardContent>
        </Card>

        <Card className="bento-card gradient-surface border-card-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              Send Job Notifications
            </CardTitle>
            <CardDescription>
              Notify users about {recentJobs.length} recent job(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentJobs.length > 0 ? (
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  Latest jobs:
                  <ul className="mt-2 space-y-1 list-disc list-inside">
                    {recentJobs.slice(0, 3).map((job, idx) => (
                      <li key={idx} className="truncate">{job.title} - {job.company}</li>
                    ))}
                  </ul>
                </div>
                <Button 
                  className="w-full"
                  onClick={handleSendJobEmails}
                  disabled={sendingJobEmail}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {sendingJobEmail ? "Sending..." : "Send to All Users"}
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No recent jobs to share</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Quick Compose */}
        <Card className="bento-card gradient-surface border-card-border/50 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-primary" />
              Quick Message
            </CardTitle>
            <CardDescription>
              Send a quick update to your alumni network
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Subject</label>
              <Input 
                placeholder="Enter email subject..." 
                className="mt-1"
                value={emailForm.subject}
                onChange={(e) => setEmailForm(prev => ({ ...prev, subject: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Message</label>
              <Textarea 
                placeholder="Write your message..." 
                className="mt-1 min-h-[100px]"
                value={emailForm.body}
                onChange={(e) => setEmailForm(prev => ({ ...prev, body: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Recipients</label>
              <div className="flex flex-wrap gap-2 mt-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleRecipientSelect("alumni")}
                  className={`text-xs sm:text-sm ${emailForm.filter === "alumni" ? "bg-primary/10 border-primary" : ""}`}
                >
                  <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  Alumni
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleRecipientSelect("student")}
                  className={`text-xs sm:text-sm ${emailForm.filter === "student" ? "bg-primary/10 border-primary" : ""}`}
                >
                  <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  Students
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleRecipientSelect("donor")}
                  className={`text-xs sm:text-sm ${emailForm.filter === "donor" ? "bg-primary/10 border-primary" : ""}`}
                >
                  <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  Donors
                </Button>
              </div>
              {emailForm.filter && (
                <p className="text-xs text-muted-foreground mt-2">
                  Selected: {emailForm.filter}
                </p>
              )}
            </div>
            <Button 
              className="w-full bg-primary hover:bg-primary/90"
              onClick={handleSendEmail}
              disabled={isSending}
            >
              <Send className="h-4 w-4 mr-2" />
              {isSending ? "Sending..." : "Send Message"}
            </Button>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="bento-card gradient-surface border-card-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Recent Notifications
            </CardTitle>
            <CardDescription>
              Latest communication updates and alerts
            </CardDescription>
          </CardHeader>
          <CardContent>
            {notificationsLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">No notifications yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {notifications.map((notification, index) => {
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

                  return (
                    <div 
                      key={notification._id || notification.id} 
                      className={`p-4 rounded-lg border transition-smooth animate-fade-in ${
                        notification.read 
                          ? "border-card-border/50 bg-transparent" 
                          : "border-primary/20 bg-primary/5"
                      }`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground">{notification.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatTimestamp(notification.createdAt || notification.timestamp)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="secondary"
                            className="text-xs"
                          >
                            {notification.type}
                          </Badge>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-primary rounded-full" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}