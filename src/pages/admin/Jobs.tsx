import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { jobService } from '@/services/ApiServices';
import { toast } from 'sonner';
import { Briefcase, MapPin, DollarSign, Check, Trash2, Clock, AlertCircle, CheckCircle, Calendar } from 'lucide-react';

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
  applicants?: any[];
  postedBy?: {
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt?: string;
}

export function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await jobService.getAllJobs(); // Changed from getJobs to getAllJobs
      
      if (response.success) {
        const jobsData = Array.isArray(response.data) 
          ? response.data 
          : Array.isArray(response.message) 
          ? response.message 
          : [];
        
        setJobs(jobsData);
      } else {
        const errorMsg = response.message || 'Failed to fetch jobs';
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Failed to load jobs';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleVerifyJob = async (jobId: string) => {
    try {
      setActionLoading(jobId);
      const response = await jobService.verifyJob(jobId);
      
      if (response.success) {
        toast.success('Job verified successfully');
        fetchJobs();
      } else {
        toast.error(response.message || 'Failed to verify job');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to verify job');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteJob = async () => {
    if (!jobToDelete) return;

    try {
      setActionLoading(jobToDelete);
      const response = await jobService.rejectJob(jobToDelete);
  
      if (response.data.success) {
        toast.success('Job rejected successfully');
        fetchJobs();
      } else {
        toast.error(response.data.message || 'Failed to reject job');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject job');
    } finally {
      setActionLoading(null);
      setDeleteDialogOpen(false);
      setJobToDelete(null);
    }
  };

  const pendingJobs = jobs.filter(job => !job.isVerified);
  const verifiedJobs = jobs.filter(job => job.isVerified);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Skeleton className="h-10 w-64 mb-6" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
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
    <div className="container mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Job Management</h1>
        <p className="text-muted-foreground mt-2">Verify and manage job postings</p>
      </div>
      
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Jobs</p>
                <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-2">{jobs.length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-200 dark:bg-blue-800 flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 border-amber-200 dark:border-amber-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Pending</p>
                <p className="text-3xl font-bold text-amber-900 dark:text-amber-100 mt-2">{pendingJobs.length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-200 dark:bg-amber-800 flex items-center justify-center">
                <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Verified</p>
                <p className="text-3xl font-bold text-green-900 dark:text-green-100 mt-2">{verifiedJobs.length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-200 dark:bg-green-800 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending" className="relative">
            <Clock className="h-4 w-4 mr-2" />
            Pending Verification
            {pendingJobs.length > 0 && (
              <Badge variant="secondary" className="ml-2 bg-amber-500 text-white hover:bg-amber-600">
                {pendingJobs.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="verified">
            <CheckCircle className="h-4 w-4 mr-2" />
            Verified Jobs
            {verifiedJobs.length > 0 && (
              <Badge variant="secondary" className="ml-2 bg-green-500 text-white hover:bg-green-600">
                {verifiedJobs.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Pending Jobs Tab */}
        <TabsContent value="pending" className="mt-6">
          {pendingJobs.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-4">
                  <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">All Caught Up!</h3>
                <p className="text-muted-foreground text-center">No pending jobs to verify</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pendingJobs.map((job) => (
                <JobCard
                  key={job._id}
                  job={job}
                  onVerify={handleVerifyJob}
                  onDelete={(id) => {
                    setJobToDelete(id);
                    setDeleteDialogOpen(true);
                  }}
                  actionLoading={actionLoading}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Verified Jobs Tab */}
        <TabsContent value="verified" className="mt-6">
          {verifiedJobs.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="h-20 w-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                  <Briefcase className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Verified Jobs</h3>
                <p className="text-muted-foreground text-center">Verified jobs will appear here</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {verifiedJobs.map((job) => (
                <JobCard
                  key={job._id}
                  job={job}
                  onDelete={(id) => {
                    setJobToDelete(id);
                    setDeleteDialogOpen(true);
                  }}
                  actionLoading={actionLoading}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Job Posting?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently reject and delete the job posting.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteJob} className="bg-destructive hover:bg-destructive/90">
              Reject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface JobCardProps {
  job: Job;
  onVerify?: (id: string) => void;
  onDelete: (id: string) => void;
  actionLoading: string | null;
}

function JobCard({ job, onVerify, onDelete, actionLoading }: JobCardProps) {
  return (
    <Card className="group hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border-2">
      <CardHeader className="space-y-3">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-xl line-clamp-2 group-hover:text-primary transition-colors">
            {job.title}
          </CardTitle>
          {job.isVerified ? (
            <Badge className="bg-green-500 hover:bg-green-600 shrink-0 shadow-sm">
              <Check className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          ) : (
            <Badge className="bg-amber-500 hover:bg-amber-600 text-white shrink-0 shadow-sm">
              <Clock className="h-3 w-3 mr-1" />
              Pending
            </Badge>
          )}
        </div>
        <CardDescription className="line-clamp-1 text-base font-medium">
          {job.company || 'Company Not Specified'}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
          {job.description}
        </p>
        
        <div className="space-y-2.5">
          {job.location && (
            <div className="flex items-center gap-2 text-sm">
              <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center shrink-0">
                <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="truncate font-medium">{job.location}</span>
            </div>
          )}
          
          {job.salary && (
            <div className="flex items-center gap-2 text-sm">
              <div className="h-8 w-8 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center shrink-0">
                <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <span className="font-medium">${job.salary.toLocaleString()} / year</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-sm">
            <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center shrink-0">
              <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="font-medium">{new Date(job.createdAt).toLocaleDateString()}</span>
          </div>

          {job.jobType && (
            <div className="flex items-center gap-2 text-sm">
              <div className="h-8 w-8 rounded-lg bg-orange-100 dark:bg-orange-900 flex items-center justify-center shrink-0">
                <Briefcase className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
              <span className="font-medium">{job.jobType}</span>
            </div>
          )}
        </div>

        {job.category && (
          <Badge variant="outline" className="text-xs font-medium">
            {job.category}
          </Badge>
        )}

        {job.requirements && job.requirements.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-semibold">Requirements:</p>
            <div className="flex flex-wrap gap-2">
              {job.requirements.slice(0, 2).map((req, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {req}
                </Badge>
              ))}
              {job.requirements.length > 2 && (
                <Badge variant="secondary" className="text-xs">
                  +{job.requirements.length - 2} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {job.applicants && job.applicants.length > 0 && (
          <div className="pt-3 border-t">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  {job.applicants.length}
                </span>
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                Applicant{job.applicants.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="gap-2 pt-4 border-t">
        {!job.isVerified && onVerify && (
          <Button 
            onClick={() => onVerify(job._id)} 
            disabled={actionLoading === job._id}
            className="flex-1 bg-green-600 hover:bg-green-700 shadow-sm"
            size="sm"
          >
            <Check className="h-4 w-4 mr-2" />
            Verify
          </Button>
        )}
        <Button 
          onClick={() => onDelete(job._id)} 
          disabled={actionLoading === job._id}
          variant="destructive"
          size="sm"
          className={`shadow-sm ${!job.isVerified && onVerify ? "" : "flex-1"}`}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Reject
        </Button>
      </CardFooter>
    </Card>
  );
}

export default Jobs;