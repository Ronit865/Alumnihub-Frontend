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
            Welcome to AllyNet
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
        <div className="stats-card-orange">
          <div className="flex items-center justify-between">
            <div>
              <p className="stats-card-label">Total Alumni</p>
              <p className="stats-card-number">{stats.totalAlumni.toLocaleString()}</p>
            </div>
            <Users className="stats-card-icon" />
          </div>
        </div>
        <div className="stats-card-blue">
          <div className="flex items-center justify-between">
            <div>
              <p className="stats-card-label">Active Events</p>
              <p className="stats-card-number">{stats.activeEvents}</p>
            </div>
            <Calendar className="stats-card-icon" />
          </div>
        </div>
        <div className="stats-card-teal">
          <div className="flex items-center justify-between">
            <div>
              <p className="stats-card-label">Total Events</p>
              <p className="stats-card-number">{stats.totalEvents}</p>
            </div>
            <Briefcase className="stats-card-icon" />
          </div>
        </div>
        <div className="stats-card-pink">
          <div className="flex items-center justify-between">
            <div>
              <p className="stats-card-label">Donations</p>
              <p className="stats-card-number">{stats.totalDonations}</p>
            </div>
            <Heart className="stats-card-icon" />
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
            <div className="p-3 bg-muted/50 rounded-lg">
              <h4 className="font-medium text-sm">DevOps Engineer</h4>
              <p className="text-xs text-muted-foreground">Amazon • ₹150k-190k</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <h4 className="font-medium text-sm">UI/UX Designer</h4>
              <p className="text-xs text-muted-foreground">Adobe • ₹120k-160k</p>
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
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col items-center p-3 rounded-lg hover:bg-muted/50 transition-colors text-center">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-2 shadow-sm">
                <img 
                  src="https://logos-world.net/wp-content/uploads/2020/09/Tata-Consultancy-Services-TCS-Logo.png" 
                  alt="TCS Logo" 
                  className="w-10 h-7 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <span className="text-blue-600 font-bold text-sm hidden">TCS</span>
              </div>
              <p className="font-medium text-xs mb-1">TCS</p>
              <p className="text-xs text-muted-foreground">250+ alumni</p>
            </div>
            
            <div className="flex flex-col items-center p-3 rounded-lg hover:bg-muted/50 transition-colors text-center">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-2 shadow-sm">
                <img 
                  src="https://logos-world.net/wp-content/uploads/2020/06/Infosys-Logo.png" 
                  alt="Infosys Logo" 
                  className="w-10 h-7 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <span className="text-blue-600 font-bold text-sm hidden">INF</span>
              </div>
              <p className="font-medium text-xs mb-1">Infosys</p>
              <p className="text-xs text-muted-foreground">180+ alumni</p>
            </div>
            
            <div className="flex flex-col items-center p-3 rounded-lg hover:bg-muted/50 transition-colors text-center">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-2 shadow-sm">
                <img 
                  src="https://logos-world.net/wp-content/uploads/2020/09/Google-Logo.png" 
                  alt="Google Logo" 
                  className="w-9 h-9 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <span className="text-blue-600 font-bold text-sm hidden">G</span>
              </div>
              <p className="font-medium text-xs mb-1">Google</p>
              <p className="text-xs text-muted-foreground">45+ alumni</p>
            </div>
            
            <div className="flex flex-col items-center p-3 rounded-lg hover:bg-muted/50 transition-colors text-center">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-2 shadow-sm">
                <img 
                  src="https://logos-world.net/wp-content/uploads/2020/09/Microsoft-Logo.png" 
                  alt="Microsoft Logo" 
                  className="w-10 h-7 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <span className="text-blue-600 font-bold text-sm hidden">MS</span>
              </div>
              <p className="font-medium text-xs mb-1">Microsoft</p>
              <p className="text-xs text-muted-foreground">38+ alumni</p>
            </div>
            
            <div className="flex flex-col items-center p-3 rounded-lg hover:bg-muted/50 transition-colors text-center">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-2 shadow-sm">
                <img 
                  src="https://logos-world.net/wp-content/uploads/2020/07/IBM-Logo.png" 
                  alt="IBM Logo" 
                  className="w-10 h-7 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <span className="text-blue-800 font-bold text-sm hidden">IBM</span>
              </div>
              <p className="font-medium text-xs mb-1">IBM</p>
              <p className="text-xs text-muted-foreground">95+ alumni</p>
            </div>
            
            <div className="flex flex-col items-center p-3 rounded-lg hover:bg-muted/50 transition-colors text-center">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-2 shadow-sm">
                <img 
                  src="https://logos-world.net/wp-content/uploads/2020/09/Wipro-Logo.png" 
                  alt="Wipro Logo" 
                  className="w-10 h-7 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <span className="text-purple-600 font-bold text-sm hidden">WP</span>
              </div>
              <p className="font-medium text-xs mb-1">Wipro</p>
              <p className="text-xs text-muted-foreground">120+ alumni</p>
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