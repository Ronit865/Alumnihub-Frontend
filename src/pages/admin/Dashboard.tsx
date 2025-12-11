import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Calendar, DollarSign, TrendingUp, UserCheck, Mail, Award, ArrowUpRight, Loader2, GraduationCap } from "lucide-react";
import { useState, useEffect } from "react";
import { adminService, eventService, handleApiError } from "@/services/ApiServices";
import { toast } from "sonner";
import { Navigate, useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar } from 'recharts';

const recentActivities = [
  {
    id: 1,
    type: "new_member",
    title: "New Alumni Registration",
    description: "Priya Sharma (Class of 2020) joined the network",
    time: "2 hours ago",
    icon: UserCheck,
  },
  {
    id: 2,
    type: "event",
    title: "Tech Innovation Summit",
    description: "AI in Indian Agriculture - 120 attendees registered",
    time: "4 hours ago",
    icon: Calendar,
  },
  {
    id: 3,
    type: "donation",
    title: "New Donation",
    description: "₹2,50,000 received for scholarship fund",
    time: "6 hours ago",
    icon: DollarSign,
  },
  {
    id: 4,
    type: "achievement",
    title: "Alumni Achievement",
    description: "Rajesh Kumar featured in Forbes India 30 Under 30",
    time: "1 day ago",
    icon: Award,
  },
  {
    id: 5,
    type: "event",
    title: "Alumni Meetup Mumbai",
    description: "Networking event at IIT Bombay - 85 RSVPs",
    time: "2 days ago",
    icon: Calendar,
  },
  {
    id: 6,
    type: "new_member",
    title: "New Alumni Registration",
    description: "Ananya Patel (Class of 2019) from Bangalore joined",
    time: "3 days ago",
    icon: UserCheck,
  },
];

// Add donation data
const donationData = [
  { month: 'Jan', donations: 180000, donors: 45 },
  { month: 'Feb', donations: 220000, donors: 52 },
  { month: 'Mar', donations: 280000, donors: 68 },
  { month: 'Apr', donations: 340000, donors: 78 },
  { month: 'May', donations: 290000, donors: 65 },
  { month: 'Jun', donations: 420000, donors: 92 },
  { month: 'Jul', donations: 380000, donors: 85 },
  { month: 'Aug', donations: 450000, donors: 98 },
  { month: 'Sep', donations: 520000, donors: 115 },
  { month: 'Oct', donations: 480000, donors: 102 },
  { month: 'Nov', donations: 560000, donors: 128 },
  { month: 'Dec', donations: 640000, donors: 145 }
];

const DEPARTMENT_COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff7300',
  '#00ff88', '#ff6b6b', '#4ecdc4', '#45b7d1',
  '#96ceb4', '#ffeaa7', '#fab1a0', '#fd79a8'
];

export function Dashboard() {
  const [totalAlumni, setTotalAlumni] = useState<number>(0);
  const [totalEvents, setTotalEvents] = useState<number>(0);
  const [departmentData, setDepartmentData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Fetch dashboard data with better error handling
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch alumni data with proper response handling
        try {
          const alumniResponse = await adminService.getAllUsers();
          
          // Extract data from the response object
          const alumni = Array.isArray(alumniResponse?.data) 
            ? alumniResponse.data 
            : [];
          
          setTotalAlumni(alumni.length);

          // Process department data safely
          const courseCounts = alumni.reduce((acc: any, user: any) => {
            const course = user?.course || 'Not Specified';
            acc[course] = (acc[course] || 0) + 1;
            return acc;
          }, {});

          const chartData = Object.entries(courseCounts).map(([name, value], index) => ({
            name,
            value: value as number,
            color: DEPARTMENT_COLORS[index % DEPARTMENT_COLORS.length]
          }));

          setDepartmentData(chartData);
        } catch (alumniError) {
          console.warn('Failed to fetch alumni data:', alumniError);
          setTotalAlumni(0);
          setDepartmentData([]);
        }

        // Fetch events data with fallback
        try {
          const eventsResponse = await eventService.getEvents();
          const events = eventsResponse?.data || [];
          setTotalEvents(Array.isArray(events) ? events.length : 0);
        } catch (eventsError) {
          console.warn('Failed to fetch events data:', eventsError);
          setTotalEvents(0);
        }

      } catch (error: any) {
        console.error('Dashboard data fetch error:', error);
        setError('Failed to load dashboard data. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Safe render functions with null checks
  const renderCustomLabel = (entry: any) => {
    try {
      if (!departmentData || departmentData.length === 0) return '';
      const total = departmentData.reduce((sum, item) => sum + (item?.value || 0), 0);
      if (total === 0) return '';
      const percent = ((entry?.value || 0) / total * 100).toFixed(1);
      return `${percent}%`;
    } catch (err) {
      console.warn('Error rendering custom label:', err);
      return '';
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    try {
      if (active && payload && payload.length && payload[0]?.payload) {
        const data = payload[0].payload;
        return (
          <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
            <p className="font-medium">{data.name || 'Unknown'}</p>
            <p className="text-sm text-muted-foreground">
              Alumni: <span className="font-semibold text-foreground">{data.value || 0}</span>
            </p>
          </div>
        );
      }
    } catch (err) {
      console.warn('Error rendering tooltip:', err);
    }
    return null;
  };

  const CustomDonationTooltip = ({ active, payload, label }: any) => {
    try {
      if (active && payload && payload.length >= 2) {
        return (
          <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
            <p className="font-medium">{label || 'Unknown'}</p>
            <p className="text-sm text-blue-600">
              Donations: <span className="font-semibold">₹{(payload[0]?.value || 0).toLocaleString()}</span>
            </p>
            <p className="text-sm text-green-600">
              Donors: <span className="font-semibold">{payload[1]?.value || 0}</span>
            </p>
          </div>
        );
      }
    } catch (err) {
      console.warn('Error rendering donation tooltip:', err);
    }
    return null;
  };

  // Error boundary fallback
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground">Something went wrong</h2>
          <p className="text-muted-foreground mt-2">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4"
            variant="outline"
          >
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="space-y-8 pb-0">
        {/* Header Skeleton */}
        <div className="animate-fade-in">
          <Skeleton className="h-9 w-48 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>

        {/* KPI Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-up">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>

        {/* Main Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 rounded-lg" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Skeleton className="h-96 rounded-lg" />
              <Skeleton className="h-96 rounded-lg" />
            </div>
          </div>
          <div className="lg:col-span-1">
            <Skeleton className="h-[700px] rounded-lg" />
          </div>
        </div>

        {/* Bottom Section Skeleton */}
        <Skeleton className="h-96 rounded-lg" />
      </div>
    );
  }


  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8 pb-0">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
          Welcome back! Here's what's happening with your alumni network.
        </p>
      </div>

      {/* KPI Grid - Bento Style */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 animate-slide-up">
        <div className="stats-card-orange">
          <div className="flex items-center justify-between">
            <div>
              <p className="stats-card-label">Total Alumni</p>
              <p className="stats-card-number">{totalAlumni.toLocaleString()}</p>
              <p className="text-xs text-white/80 flex items-center gap-1 mt-1">
                <ArrowUpRight className="w-3 h-3" />
                +2.1% from last month
              </p>
            </div>
            <Users className="stats-card-icon" />
          </div>
        </div>

        <div className="stats-card-blue">
          <div className="flex items-center justify-between">
            <div>
              <p className="stats-card-label">Total Events</p>
              <p className="stats-card-number">{totalEvents.toString()}</p>
              <p className="text-xs text-white/80 flex items-center gap-1 mt-1">
                <ArrowUpRight className="w-3 h-3" />
                +15% this month
              </p>
            </div>
            <Calendar className="stats-card-icon" />
          </div>
        </div>

        <div className="stats-card-pink">
          <div className="flex items-center justify-between">
            <div>
              <p className="stats-card-label">Total Donations</p>
              <p className="stats-card-number">₹ 2.4Cr</p>
              <p className="text-xs text-white/80 flex items-center gap-1 mt-1">
                <ArrowUpRight className="w-3 h-3" />
                +12.5% this year
              </p>
            </div>
            <DollarSign className="stats-card-icon" />
          </div>
        </div>

        <div className="stats-card-teal">
          <div className="flex items-center justify-between">
            <div>
              <p className="stats-card-label">Engagement Rate</p>
              <p className="stats-card-number">68%</p>
              <p className="text-xs text-white/80 flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" />
                +5.2% active users
              </p>
            </div>
            <TrendingUp className="stats-card-icon" />
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
        {/* Quick Actions - Larger Bento Card */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <Card className="bento-card gradient-surface border-card-border/50">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                Quick Actions
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Frequently used management tools
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
                <Button onClick={() => navigate('/admin/alumni')} variant="outline" className="h-16 sm:h-20 flex-col gap-1 sm:gap-2 bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-700 hover:text-orange-800 dark:bg-orange-950 dark:hover:bg-orange-900 dark:border-orange-800 dark:text-orange-300 dark:hover:text-orange-200 transition-smooth">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 dark:text-orange-400" />
                  <span className="text-xs sm:text-sm">Alumni</span>
                </Button>
                <Button onClick={() => navigate('/admin/events')} variant="outline" className="h-16 sm:h-20 flex-col gap-1 sm:gap-2 bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 hover:text-blue-800 dark:bg-blue-950 dark:hover:bg-blue-900 dark:border-blue-800 dark:text-blue-300 dark:hover:text-blue-200 transition-smooth">
                  <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs sm:text-sm">Events</span>
                </Button>
                <Button onClick={() => navigate('/admin/communications')} variant="outline" className="h-16 sm:h-20 flex-col gap-1 sm:gap-2 bg-teal-50 hover:bg-teal-100 border-teal-200 text-teal-700 hover:text-teal-800 dark:bg-teal-950 dark:hover:bg-teal-900 dark:border-teal-800 dark:text-teal-300 dark:hover:text-teal-200 transition-smooth">
                  <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-teal-600 dark:text-teal-400" />
                  <span className="text-xs sm:text-sm">Messages</span>
                </Button>
                <Button onClick={() => navigate('/admin/donations')} variant="outline" className="h-16 sm:h-20 flex-col gap-1 sm:gap-2 bg-pink-50 hover:bg-pink-100 border-pink-200 text-pink-700 hover:text-pink-800 dark:bg-pink-950 dark:hover:bg-pink-900 dark:border-pink-800 dark:text-pink-300 dark:hover:text-pink-200 transition-smooth">
                  <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-pink-600 dark:text-pink-400" />
                  <span className="text-xs sm:text-sm">Donations</span>
                </Button>
                <Button onClick={() => navigate('/admin/analytics')} variant="outline" className="h-16 sm:h-20 flex-col gap-1 sm:gap-2 bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700 hover:text-purple-800 dark:bg-purple-950 dark:hover:bg-purple-900 dark:border-purple-800 dark:text-purple-300 dark:hover:text-purple-200 transition-smooth">
                  <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
                  <span className="text-xs sm:text-sm">Analytics</span>
                </Button>
                <Button onClick={() => navigate('/admin/jobs')} variant="outline" className="h-16 sm:h-20 flex-col gap-1 sm:gap-2 bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700 hover:text-emerald-800 dark:bg-emerald-950 dark:hover:bg-emerald-900 dark:border-emerald-800 dark:text-emerald-300 dark:hover:text-emerald-200 transition-smooth">
                  <Award className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs sm:text-sm">Jobs</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <Card className="bento-card gradient-surface border-card-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  Alumni by Department
                </CardTitle>
                <CardDescription>
                  Distribution of alumni across different departments
                </CardDescription>
              </CardHeader>
              <CardContent>
                {departmentData && departmentData.length > 0 ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={departmentData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={renderCustomLabel}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {departmentData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry?.color || DEPARTMENT_COLORS[0]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-80 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No department data available</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Department Statistics with safer rendering */}
            <Card className="bento-card gradient-surface border-card-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Department Statistics
                </CardTitle>
                <CardDescription>
                  Detailed breakdown by department
                </CardDescription>
              </CardHeader>
              <CardContent>
                {departmentData && departmentData.length > 0 ? (
                  <div className="space-y-4 max-h-80 overflow-y-auto">
                    {departmentData
                      .sort((a, b) => (b?.value || 0) - (a?.value || 0))
                      .map((dept, index) => {
                        if (!dept) return null;
                        
                        const total = departmentData.reduce((sum, item) => sum + (item?.value || 0), 0);
                        const percentage = total > 0 ? ((dept.value / total) * 100).toFixed(1) : '0.0';

                        return (
                          <div key={dept.name || index} className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/30 transition-smooth">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: dept.color || DEPARTMENT_COLORS[0] }}
                              />
                              <div>
                                <p className="text-sm font-medium text-foreground">{dept.name || 'Unknown'}</p>
                                <p className="text-xs text-muted-foreground">
                                  {percentage}% of total
                                </p>
                              </div>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {dept.value || 0}
                            </Badge>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <div className="h-60 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No department data available</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Activity */}
        <Card className="bento-card gradient-surface border-card-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest updates and notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities?.map((activity, index) => {
                if (!activity) return null;
                
                return (
                  <div
                    key={activity.id || index}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/30 transition-smooth animate-fade-in"
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      {activity.icon && <activity.icon className="h-4 w-4 text-primary" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {activity.title || 'Unknown Activity'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.description || 'No description'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {activity.time || 'Unknown time'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            <Button variant="ghost" className="w-full mt-4 text-primary hover:bg-primary/10">
              View All Activities
              <ArrowUpRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Donation Trends Section with safe rendering */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="bento-card gradient-surface border-card-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Donation Trends
            </CardTitle>
            <CardDescription>
              Monthly donation amounts over the year
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={donationData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="month" 
                    className="text-muted-foreground text-xs"
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    className="text-muted-foreground text-xs"
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `₹${((value || 0) / 1000).toFixed(0)}K`}
                  />
                  <Tooltip content={<CustomDonationTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="donations" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bento-card gradient-surface border-card-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-primary" />
              Monthly Donors
            </CardTitle>
            <CardDescription>
              Number of donors contributing each month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={donationData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="month" 
                    className="text-muted-foreground text-xs"
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    className="text-muted-foreground text-xs"
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    formatter={(value, name) => [value || 0, 'Donors']}
                    labelStyle={{ color: 'var(--foreground)' }}
                    contentStyle={{ 
                      backgroundColor: 'var(--background)', 
                      border: '1px solid var(--border)',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar 
                    dataKey="donors" 
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                    className="hover:opacity-80 transition-opacity"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Donation Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bento-card gradient-surface border-card-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Raised</p>
                <p className="text-2xl font-bold text-foreground">₹47.9L</p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  +18.2% from last year
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bento-card gradient-surface border-card-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Donors</p>
                <p className="text-2xl font-bold text-foreground">1,023</p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  +12.4% this year
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bento-card gradient-surface border-card-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Donation</p>
                <p className="text-2xl font-bold text-foreground">₹4,680</p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  +5.1% per donor
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}