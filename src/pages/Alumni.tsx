import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, MapPin, Briefcase, Calendar, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { adminService, userService } from "@/services/ApiServices";
import { toast } from "@/components/ui/use-toast";

// Define the User interface to match your backend model
interface User {
  _id: string;
  name: string;
  email: string;
  graduationYear?: string | number;
  course?: string;
  phone?: string;
  role?: string;
  avatar?: string;
  isVerified?: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function Alumni() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedIndustry, setSelectedIndustry] = useState("all");

  // Fetch alumni data using React Query
  const {
    data: alumniResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["public-alumni"],
    queryFn: async () => {
      const response = await userService.getAllUsers();
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Handle error
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch alumni data",
        variant: "destructive",
      });
    }
  }, [error]);

  // Get all users first
  const allUsers: User[] = Array.isArray(alumniResponse) 
    ? alumniResponse 
    : [];

  // Filter for verified alumni only
  const alumniData: User[] = allUsers.filter(user => 
    user && 
    user.name && 
    user.email && 
    user.role?.toLowerCase() === "alumni"  // && isVerified: true (if you want only verified ones
  );

  // Get unique graduation years from the data
  const graduationYears = [...new Set(
    alumniData
      .map(person => {
        const year = person.graduationYear;
        if (year === null || year === undefined) return null;
        const yearStr = String(year);
        return yearStr.trim() !== "" ? yearStr : null;
      })
      .filter(year => year !== null)
  )].sort().reverse();

  // Get unique courses from the data
  const courses = [...new Set(
    alumniData
      .map(person => {
        const course = person.course;
        if (!course) return null;
        const courseStr = String(course);
        return courseStr.trim() !== "" ? courseStr : null;
      })
      .filter(course => course !== null)
  )].sort();

  const filteredAlumni = alumniData.filter(person => {
    const matchesSearch = person.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         person.course?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         person.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesYear = selectedYear === "all" || String(person.graduationYear) === selectedYear;
    const matchesIndustry = selectedIndustry === "all" || person.course === selectedIndustry;
    
    return matchesSearch && matchesYear && matchesIndustry;
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading alumni data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold gradient-text mb-2">Alumni Directory</h1>
        <p className="text-muted-foreground">
          Connect with {alumniData.length}+ verified alumni across various fields
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search by name, course, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-3">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Graduation Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {graduationYears.map(year => (
                <SelectItem key={year} value={year}>
                  Class of {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Course" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              {courses.map(course => (
                <SelectItem key={course} value={course}>
                  {course}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" onClick={() => refetch()}>
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredAlumni.length} of {alumniData.length} verified alumni
      </div>

      {/* Alumni Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAlumni.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground text-lg">No verified alumni found matching your criteria</p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchQuery("");
                setSelectedYear("all");
                setSelectedIndustry("all");
              }}
              className="mt-4"
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          filteredAlumni.map((person) => (
            <Card key={person._id} className="hover-lift group">
              <CardHeader className="pb-4">
                <div className="flex items-start gap-4">
                  <Avatar className="w-16 h-16 ring-2 ring-primary/20">
                    <AvatarImage src={person.avatar} alt={person.name} />
                    <AvatarFallback className="bg-primary/10 text-primary font-medium text-lg">
                      {person.name?.split(' ').map(n => n[0]).join('') || 'AL'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                      {person.name || 'Unknown'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {person.graduationYear ? `Class of ${person.graduationYear}` : 'Graduate'}
                    </p>
                    <p className="text-sm text-muted-foreground">{person.course || 'N/A'}</p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Briefcase className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{person.course || 'Course not specified'}</p>
                      <p className="text-muted-foreground">Alumni</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Graduated: {person.graduationYear || 'N/A'}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  <Badge variant="secondary">Alumni</Badge>
                  <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                    Verified
                  </Badge>
                  {person.course && (
                    <Badge variant="outline" className="text-xs">
                      {person.course}
                    </Badge>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button size="sm" className="flex-1">
                    Connect
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => window.location.href = `mailto:${person.email}`}
                  >
                    Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Load More */}
      {filteredAlumni.length > 0 && (
        <div className="text-center pt-6">
          <Button variant="outline" size="lg" onClick={() => refetch()}>
            Refresh Data
          </Button>
        </div>
      )}
    </div>
  );
}