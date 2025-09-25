import { Calendar, Users, Briefcase, TrendingUp, Heart, MessageCircle, Loader2 } from "lucide-react";
import { BentoCard } from "@/components/ui/bento-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adminService, eventService, userService } from "@/services/ApiServices";
import { toast } from "sonner";

interface DashboardStats {
  totalAlumni: number;
  totalEvents: number;
  activeEvents: number;
  totalDonations: string;
}

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  location?: string;
  isactive: boolean;
  participants: string[];
}

interface Alumni {
  _id: string;
  name: string;
  email: string;
  role?: string;
  graduationYear?: string;
  course?: string;
  isVerified?: boolean;
}
export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalAlumni: 0,
    totalEvents: 0,
    activeEvents: 0,
    totalDonations: "₹0"
  });
  const [recentEvents, setRecentEvents] = useState<Event[]>([]);
  const [featuredAlumni, setFeaturedAlumni] = useState<Alumni[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);


  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch alumni data
      const alumniResponse = await userService.getAllUsers();
      const allUsers = Array.isArray(alumniResponse) ? alumniResponse : [];
      
      // Filter verified alumni
      const verifiedAlumni = allUsers.filter((user: Alumni) => 
        user.role?.toLowerCase() === "alumni" 
      );

      // Fetch events data
      const eventsResponse = await eventService.getEvents();
      const allEvents = eventsResponse.success ? eventsResponse.data : [];
      
      // Filter active events
      const activeEvents = allEvents.filter((event: Event) => event.isactive);
      
      // Get upcoming events (next 3)
      const upcomingEvents = activeEvents
        .filter((event: Event) => new Date(event.date) >= new Date())
        .sort((a: Event, b: Event) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 3);

      // Get featured alumni (random sample)
      const featured = verifiedAlumni
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);

      setStats({
        totalAlumni: verifiedAlumni.length,
        totalEvents: allEvents.length,
        activeEvents: activeEvents.length,
        totalDonations: "₹2.4M" // This would come from donation service
      });

      setRecentEvents(upcomingEvents);
      setFeaturedAlumni(featured);

    } catch (error: any) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const getAlumniInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-8 text-white">
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-4">
            Welcome to AlumniHub
          </h1>
          <p className="text-xl text-primary-foreground/90 mb-6 max-w-2xl">
            Connect, engage, and grow with our vibrant alumni community. Discover events, 
            opportunities, and meaningful connections that last a lifetime.
          </p>
          <div className="flex gap-4">
            <Button onClick={() => navigate('/communications')} size="lg" className="bg-white text-primary hover:bg-white/90">
              Explore Community
            </Button>
            <Button onClick={() => navigate('/events')} size="lg" className="bg-white text-primary hover:bg-white/90">
              Join Events
            </Button>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl p-6 border hover-lift">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Alumni</p>
              <p className="text-2xl font-bold">{stats.totalAlumni.toLocaleString()}</p>
            </div>
            <Users className="w-8 h-8 text-primary" />
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 border hover-lift">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Events</p>
              <p className="text-2xl font-bold">{stats.activeEvents}</p>
            </div>
            <Calendar className="w-8 h-8 text-primary" />
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 border hover-lift">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Events</p>
              <p className="text-2xl font-bold">{stats.totalEvents}</p>
            </div>
            <Briefcase className="w-8 h-8 text-primary" />
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 border hover-lift">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Donations</p>
              <p className="text-2xl font-bold">{stats.totalDonations}</p>
            </div>
            <Heart className="w-8 h-8 text-primary" />
          </div>
        </div>
      </div>

      {/* Bento Grid - Fixed Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Upcoming Events (Takes 2/3 width on large screens) */}
        <div className="lg:col-span-2">
          <BentoCard 
            title="Upcoming Events" 
            description="Don't miss these exciting opportunities"
            size="lg" 
            gradient
            className="h-full"
          >
            <div className="space-y-4">
              {recentEvents.length > 0 ? (
                recentEvents.map((event, index) => (
                  <div key={event._id} className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{event.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {formatEventDate(event.date)} • {event.location || 'Location TBD'}
                      </p>
                    </div>
                    <Badge variant={index % 3 === 0 ? "default" : index % 3 === 1 ? "secondary" : "outline"}>
                      Event
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-8">No upcoming events</p>
              )}
              <Button 
                className="w-full mt-4" 
                onClick={() => navigate('/events')}
              >
                View All Events
              </Button>
            </div>
          </BentoCard>
        </div>

        {/* Right Column - Alumni Spotlight */}
        <div className="lg:col-span-1">
          <BentoCard 
            title="Alumni Spotlight" 
            description="Celebrating our community achievements"
            size="md"
            className="h-full"
          >
            <div className="space-y-4">
              {featuredAlumni.length > 0 ? (
                featuredAlumni.map((alumni) => (
                  <div key={alumni._id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-medium text-primary">
                        {getAlumniInitials(alumni.name)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {alumni.name} {alumni.graduationYear && `'${String(alumni.graduationYear).slice(-2)}`}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {alumni.course || 'Alumni'}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-8">No featured alumni</p>
              )}
            </div>
          </BentoCard>
        </div>
      </div>


      {/* Second Row - Four Equal Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <BentoCard 
          title="Job Opportunities" 
          description="Latest career opportunities"
          size="md"
          className="h-full"
        >
          <div className="space-y-3">
            <div className="p-3 bg-muted/50 rounded-lg">
              <h4 className="font-medium text-sm">Senior Software Engineer</h4>
              <p className="text-xs text-muted-foreground">Google • ₹180k-220k</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <h4 className="font-medium text-sm">Product Manager</h4>
              <p className="text-xs text-muted-foreground">Meta • ₹160k-200k</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <h4 className="font-medium text-sm">Data Scientist</h4>
              <p className="text-xs text-muted-foreground">Microsoft • ₹140k-180k</p>
            </div>
            <Button onClick={() => navigate('/jobs')} size="sm" className="w-full mt-2">
              View All Jobs
            </Button>
          </div>
        </BentoCard>

        <BentoCard 
          title="Top Companies" 
          description="Where our alumni thrive"
          size="md"
          className="h-full"
        >
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xs">TCS</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">Tata Consultancy Services</p>
                <p className="text-xs text-muted-foreground">250+ alumni</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xs">INF</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">Infosys</p>
                <p className="text-xs text-muted-foreground">180+ alumni</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xs">G</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">Google</p>
                <p className="text-xs text-muted-foreground">45+ alumni</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xs">MS</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">Microsoft</p>
                <p className="text-xs text-muted-foreground">38+ alumni</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xs">WP</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">Wipro</p>
                <p className="text-xs text-muted-foreground">120+ alumni</p>
              </div>
            </div>
          </div>
        </BentoCard>

        <BentoCard 
          title="Community Chat" 
          description="Recent conversations"
          size="md"
          className="h-full"
        >
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-2 rounded-lg">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Alumni '20</p>
                <p className="text-sm">Looking for mentorship in AI/ML field</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-2 rounded-lg">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Alumni '18</p>
                <p className="text-sm">Startup founder seeking investors</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-2 rounded-lg">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Alumni '22</p>
                <p className="text-sm">Anyone attending tech conference?</p>
              </div>
            </div>
            <Button onClick={() => navigate('/communications')} size="sm" className="w-full">
              Join Conversation
            </Button>
          </div>
        </BentoCard>

        <BentoCard 
          title="Donation Impact" 
          description="Making a difference together"
          size="md"
          className="h-full"
        >
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{stats.totalDonations}</p>
              <p className="text-sm text-muted-foreground">Raised this year</p>
            </div>
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Scholarships</span>
                  <span>65%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full transition-all duration-500" style={{ width: '65%' }}></div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Research</span>
                  <span>25%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full transition-all duration-500" style={{ width: '25%' }}></div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Infrastructure</span>
                  <span>10%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full transition-all duration-500" style={{ width: '10%' }}></div>
                </div>
              </div>
            </div>
            <Button className="w-full">Support a Cause</Button>
          </div>
        </BentoCard>
      </div>
    </div>
  );
}