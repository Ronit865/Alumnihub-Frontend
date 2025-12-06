import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { jobService } from "@/services/ApiServices";
import { toast } from "sonner";
import { Briefcase, MapPin, DollarSign, Clock, CheckCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PostJobDialog from "@/components/PostJobDialog";

interface Job {
  _id: string;
  title: string;
  description: string;
  company?: string;
  location?: string;
  salary?: number;
  requirements?: string[];
  isVerified: boolean;
  jobType?: string;
  category?: string;
  experienceRequired?: string;
  postedBy: {
    name: string;
    email: string;
  };
  createdAt: string;
}

export default function Jobs() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);
  const [postJobOpen, setPostJobOpen] = useState(false);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await jobService.getAllJobs();

      if (response.success) {
        const jobsData = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.message)
          ? response.message
          : [];

        // Filter only verified jobs for regular users
        const verifiedJobs = jobsData.filter((job: Job) => job.isVerified);
        setJobs(verifiedJobs);
      } else {
        const errorMsg = response.message || "Failed to fetch jobs";
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (error: any) {
      const errorMsg =
        error.message || "Failed to load jobs";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleApply = async (jobId: string) => {
    try {
      setApplyingJobId(jobId);
      const response = await jobService.applyForJob(jobId);

      if (response.success) {
        toast.success("Application submitted successfully!");
        fetchJobs(); // Refresh to get updated data
      } else {
        toast.error(response.message || "Failed to apply for job");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to apply for job");
    } finally {
      setApplyingJobId(null);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={fetchJobs}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Job Opportunities</h1>
          <p className="text-muted-foreground">
            Browse and apply for job opportunities
          </p>
        </div>
        <Button onClick={() => setPostJobOpen(true)}>Post a Job</Button>
      </div>

      {jobs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Briefcase className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Jobs Available</h3>
            <p className="text-muted-foreground mb-4">
              Be the first to post a job opportunity!
            </p>
            <Button onClick={() => navigate("/post-job")}>Post a Job</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <Card key={job._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{job.title}</CardTitle>
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                </div>
                <CardDescription>
                  {job.company || "Company Not Specified"}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3">
                <p className="text-sm line-clamp-3">{job.description}</p>

                <div className="space-y-2">
                  {job.location && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2" />
                      {job.location}
                    </div>
                  )}

                  {job.salary && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <DollarSign className="h-4 w-4 mr-2" />
                      ${job.salary.toLocaleString()} / year
                    </div>
                  )}

                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-2" />
                    {new Date(job.createdAt).toLocaleDateString()}
                  </div>

                  {job.jobType && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Briefcase className="h-4 w-4 mr-2" />
                      {job.jobType}
                    </div>
                  )}
                </div>

                {job.category && (
                  <Badge variant="outline" className="text-xs">
                    {job.category}
                  </Badge>
                )}

                {job.requirements && job.requirements.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold mb-2">Requirements:</p>
                    <div className="flex flex-wrap gap-2">
                      {job.requirements.slice(0, 3).map((req, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {req}
                        </Badge>
                      ))}
                      {job.requirements.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{job.requirements.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>

              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={() => handleApply(job._id)}
                  disabled={applyingJobId === job._id}
                >
                  {applyingJobId === job._id ? "Applying..." : "Apply Now"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <PostJobDialog 
        open={postJobOpen} 
        onOpenChange={setPostJobOpen}
        onSuccess={fetchJobs}
      />
    </div>
  );
}
