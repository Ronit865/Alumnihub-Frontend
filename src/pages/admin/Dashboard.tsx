import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Calendar, DollarSign, TrendingUp, UserCheck, Mail, Award, ArrowUpRight, Loader2, GraduationCap } from "lucide-react";
import { useState, useEffect } from "react";
import { adminService, eventService, handleApiError } from "@/services/ApiServices";
import { toast } from "sonner";
import { Navigate, useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';





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
  const navigate = useNavigate();

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch alumni data
        const alumniResponse = await adminService.getAllUsers();
        const alumni = Array.isArray(alumniResponse) ? alumniResponse : [];
        setTotalAlumni(alumni.length);

        const eventsResponse = await eventService.getEvents();
        const events = eventsResponse.data || [];
        setTotalEvents(events.length);

        const courseCounts = alumni.reduce((acc: any, user: any) => {
          const course = user.course || 'Not Specified';
          acc[course] = (acc[course] || 0) + 1;
          return acc;
        }, {});

        const chartData = Object.entries(courseCounts).map(([name, value], index) => ({
          name,
          value: value as number,
          color: DEPARTMENT_COLORS[index % DEPARTMENT_COLORS.length]
        }));

        setDepartmentData(chartData);

      } catch (error: any) {
        const apiError = handleApiError(error);
        console.error('Failed to fetch dashboard data:', apiError.message);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const renderCustomLabel = (entry: any) => {
    if (departmentData.length === 0) return '';
    const total = departmentData.reduce((sum, item) => sum + item.value, 0);
    const percent = ((entry.value / total) * 100).toFixed(1);
    return `${percent}%`;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            Alumni: <span className="font-semibold text-foreground">{data.value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const kpiData = [
    {
      title: "Total Alumni",
      value: loading ? "..." : totalAlumni.toLocaleString(),
      change: "+2.1%",
      changeType: "increase" as const,
      icon: Users,
      description: "Active registered alumni",
    },
    {
      title: "Total Events",
      value: loading ? "..." : totalEvents.toString(),
      change: "+15%",
      changeType: "increase" as const,
      icon: Calendar,
      description: "All events",
    },
    {
      title: "Total Donations",
      value: "₹ 2.4Cr",
      change: "+12.5%",
      changeType: "increase" as const,
      icon: DollarSign,
      description: "This year",
    },
    {
      title: "Engagement Rate",
      value: "68%",
      change: "+5.2%",
      changeType: "increase" as const,
      icon: TrendingUp,
      description: "Monthly active users",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading dashboard...</span>
      </div>
    );
  }


  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back! Here's what's happening with your alumni network.
        </p>
      </div>

      {/* KPI Grid - Bento Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-up">
        <div className="stats-card-orange">
          <div className="flex items-center justify-between">
            <div>
              <p className="stats-card-label">Total Alumni</p>
              <p className="stats-card-number">{loading ? "..." : totalAlumni.toLocaleString()}</p>
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
              <p className="stats-card-number">{loading ? "..." : totalEvents.toString()}</p>
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Quick Actions - Larger Bento Card */}
        <Card className="lg:col-span-2 bento-card gradient-surface border-card-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Frequently used management tools
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Button onClick={() => navigate('/admin/alumni')} variant="outline" className="h-20 flex-col gap-2 bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-700 hover:text-orange-800 dark:bg-orange-950 dark:hover:bg-orange-900 dark:border-orange-800 dark:text-orange-300 dark:hover:text-orange-200 transition-smooth">
                <Users className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                <span className="text-sm">Manage Alumni</span>
              </Button>
              <Button onClick={() => navigate('/admin/events')} variant="outline" className="h-20 flex-col gap-2 bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 hover:text-blue-800 dark:bg-blue-950 dark:hover:bg-blue-900 dark:border-blue-800 dark:text-blue-300 dark:hover:text-blue-200 transition-smooth">
                <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                <span className="text-sm">Manage Events</span>
              </Button>
              <Button onClick={() => navigate('/admin/communications')} variant="outline" className="h-20 flex-col gap-2 bg-teal-50 hover:bg-teal-100 border-teal-200 text-teal-700 hover:text-teal-800 dark:bg-teal-950 dark:hover:bg-teal-900 dark:border-teal-800 dark:text-teal-300 dark:hover:text-teal-200 transition-smooth">
                <Mail className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                <span className="text-sm">Communications</span>
              </Button>
              <Button onClick={() => navigate('/admin/donations')} variant="outline" className="h-20 flex-col gap-2 bg-pink-50 hover:bg-pink-100 border-pink-200 text-pink-700 hover:text-pink-800 dark:bg-pink-950 dark:hover:bg-pink-900 dark:border-pink-800 dark:text-pink-300 dark:hover:text-pink-200 transition-smooth">
                <DollarSign className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                <span className="text-sm">Manage Donations</span>
              </Button>
              <Button onClick={() => navigate('/admin/analytics')} variant="outline" className="h-20 flex-col gap-2 bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700 hover:text-purple-800 dark:bg-purple-950 dark:hover:bg-purple-900 dark:border-purple-800 dark:text-purple-300 dark:hover:text-purple-200 transition-smooth">
                <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                <span className="text-sm">Analytics</span>
              </Button>
              <Button onClick={() => navigate('/admin/jobs')} variant="outline" className="h-20 flex-col gap-2 bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700 hover:text-emerald-800 dark:bg-emerald-950 dark:hover:bg-emerald-900 dark:border-emerald-800 dark:text-emerald-300 dark:hover:text-emerald-200 transition-smooth">
                <Award className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm">Manage Jobs</span>
              </Button>
            </div>
          </CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 m-2">
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
                {departmentData.length > 0 ? (
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
                            <Cell key={`cell-${index}`} fill={entry.color} />
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

            {/* Department Statistics */}
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
                {departmentData.length > 0 ? (
                  <div className="space-y-4 max-h-80 overflow-y-auto">
                    {departmentData
                      .sort((a, b) => b.value - a.value)
                      .map((dept, index) => {
                        const total = departmentData.reduce((sum, item) => sum + item.value, 0);
                        const percentage = ((dept.value / total) * 100).toFixed(1);

                        return (
                          <div key={dept.name} className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/30 transition-smooth">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: dept.color }}
                              />
                              <div>
                                <p className="text-sm font-medium text-foreground">{dept.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {percentage}% of total
                                </p>
                              </div>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {dept.value}
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
        </Card>

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
              {recentActivities.map((activity, index) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/30 transition-smooth animate-fade-in"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <activity.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {activity.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-4 text-primary hover:bg-primary/10">
              View All Activities
              <ArrowUpRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}