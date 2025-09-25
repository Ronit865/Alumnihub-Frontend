import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { IndianRupee, TrendingUp, Users, Target, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import { donationService, handleApiError, handleApiSuccess } from "@/services/ApiServices";
import { useToast } from "@/hooks/use-toast";

// Keep the static data for stats and recent donations
const donationStats = [
    {
        title: "Total Raised",
        value: "₹1,95,65,743",
        change: "+12.5%",
        changeType: "increase" as const,
        icon: IndianRupee,
        description: "This year",
    },
    {
        title: "Active Donors",
        value: "1,248",
        change: "+8.3%",
        changeType: "increase" as const,
        icon: Users,
        description: "Unique contributors",
    },
    {
        title: "Avg. Donation",
        value: "₹1,56,891",
        change: "+5.7%",
        changeType: "increase" as const,
        icon: TrendingUp,
        description: "Per donor",
    },
    {
        title: "Campaign Goal",
        value: "78%",
        change: "+2.1%",
        changeType: "increase" as const,
        icon: Target,
        description: "Of ₹2.5Cr target",
    },
];

const recentDonations = [
    {
        "id": 1,
        "donor": "Rohit Sharma",
        "email": "rohit.sharma@email.com",
        "amount": 100000,
        "campaign": "Scholarship Fund",
        "date": "2024-01-20",
        "status": "completed",
        "avatar": "/placeholder.svg",
        "class": "2019"
    },
    {
        "id": 2,
        "donor": "Ananya Mehta",
        "email": "ananya.mehta@email.com",
        "amount": 500000,
        "campaign": "Research Grant",
        "date": "2024-01-18",
        "status": "completed",
        "avatar": "/placeholder.svg",
        "class": "2018"
    },
    {
        "id": 3,
        "donor": "Anonymous",
        "email": "donor@anonymous.com",
        "amount": 205000,
        "campaign": "Campus Infrastructure",
        "date": "2024-01-15",
        "status": "completed",
        "avatar": "/placeholder.svg",
        "class": "Unknown"
    },
    {
        "id": 4,
        "donor": "Priya Nair",
        "email": "priya.nair@email.com",
        "amount": 2500000,
        "campaign": "Technology Lab",
        "date": "2024-01-12",
        "status": "pending",
        "avatar": "/placeholder.svg",
        "class": "2020"
    },
    {
        "id": 5,
        "donor": "Karan Patel",
        "email": "karan.patel@email.com",
        "amount": 7500000,
        "campaign": "Student Welfare Fund",
        "date": "2024-01-10",
        "status": "completed",
        "avatar": "/placeholder.svg",
        "class": "2017"
    }
];

// Enhanced interface for campaign data from backend - matching user side
interface Campaign {
    _id: string;
    name: string;
    description: string;
    goal: number;
    raised?: number;
    raisedAmount?: number;
    donors?: number | any[]; // Can be either number or array
    donorCount?: number;
    donorsCount?: number;
    numberOfDonors?: number;
    donations?: any[]; // Array of donation records
    endDate?: string;
    status?: string;
    createdAt?: string;
    updatedAt?: string;
    category?: string;
}

export function Donations() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    // Fetch campaigns from database
    useEffect(() => {
        const fetchCampaigns = async () => {
            try {
                setLoading(true);
                const response = await donationService.getCampaigns();
                
                console.log('Admin - API Response:', response);
                console.log('Admin - Campaign data:', response.data);
                
                if (response.success) {
                    // Process campaigns to handle the schema differences - same as user side
                    const processedCampaigns = (response.data || []).map((campaign: any) => {
                        // Handle raised amount - prioritize 'raised' over 'raisedAmount'
                        const raisedAmount = campaign.raised || campaign.raisedAmount || 0;
                        
                        // Handle donors count with multiple fallbacks - same logic as user side
                        let donorCount = 0;
                        if (Array.isArray(campaign.donors)) {
                            donorCount = campaign.donors.length;
                        } else if (typeof campaign.donors === 'number') {
                            donorCount = campaign.donors;
                        } else if (campaign.donorCount) {
                            donorCount = campaign.donorCount;
                        } else if (campaign.donorsCount) {
                            donorCount = campaign.donorsCount;
                        } else if (campaign.numberOfDonors) {
                            donorCount = campaign.numberOfDonors;
                        } else if (campaign.donations && Array.isArray(campaign.donations)) {
                            donorCount = campaign.donations.length;
                        }

                        console.log(`Admin - Campaign ${campaign.name}:`, {
                            originalData: campaign,
                            processedRaised: raisedAmount,
                            processedDonors: donorCount
                        });

                        return {
                            ...campaign,
                            raised: raisedAmount,
                            donors: donorCount
                        };
                    });
                    
                    setCampaigns(processedCampaigns);
                    setError(null);
                } else {
                    setError(response.message || "Failed to fetch campaigns");
                    toast({
                        title: "Error",
                        description: response.message || "Failed to fetch campaigns",
                        variant: "destructive",
                    });
                }
            } catch (err: any) {
                const apiError = handleApiError(err);
                setError(apiError.message || "An error occurred while fetching campaigns");
                toast({
                    title: "Error",
                    description: apiError.message || "Failed to load campaigns",
                    variant: "destructive",
                });
                console.error("Admin - Error fetching campaigns:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchCampaigns();
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-IN", { 
            style: "currency", 
            currency: "INR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "completed":
                return <Badge className="bg-success/10 text-success border-success/20">Completed</Badge>;
            case "pending":
                return <Badge variant="outline" className="border-warning text-warning">Pending</Badge>;
            case "failed":
                return <Badge variant="destructive">Failed</Badge>;
            default:
                return <Badge variant="secondary">Unknown</Badge>;
        }
    };

    // Function to calculate progress percentage
    const getProgressPercentage = (raised: number = 0, goal: number) => {
        return Math.min(Math.round((raised / goal) * 100), 100);
    };

    // Function to format date
    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch {
            return "N/A";
        }
    };

    // Updated function to safely get donor count - matching user side logic
    const getDonorCount = (campaign: Campaign): number => {
        // Handle different possible field names and formats - same as user side
        if (Array.isArray(campaign.donors)) {
            return campaign.donors.length;
        } else if (typeof campaign.donors === 'number') {
            return campaign.donors;
        } else if (typeof campaign.donorCount === 'number') {
            return campaign.donorCount;
        } else if (typeof campaign.donorsCount === 'number') {
            return campaign.donorsCount;
        } else if (typeof campaign.numberOfDonors === 'number') {
            return campaign.numberOfDonors;
        } else if (campaign.donations && Array.isArray(campaign.donations)) {
            return campaign.donations.length;
        } else if (typeof campaign.donors === 'string') {
            // Try to parse if it's a string number
            const parsed = parseInt(campaign.donors, 10);
            return isNaN(parsed) ? 0 : parsed;
        }
        return 0;
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="animate-fade-in">
                <h1 className="text-3xl font-bold text-foreground">Donation Management</h1>
                <p className="text-muted-foreground mt-2">
                    Track fundraising campaigns, donations, and donor engagement.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-up">
                <div className="stats-card-pink">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="stats-card-label">Total Raised</p>
                            <p className="stats-card-number">₹1.95Cr</p>
                            <p className="text-xs text-white/80 flex items-center gap-1 mt-1">
                                <ArrowUpRight className="w-3 h-3" />
                                +12.5% this year
                            </p>
                        </div>
                        <IndianRupee className="stats-card-icon" />
                    </div>
                </div>

                <div className="stats-card-blue">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="stats-card-label">Active Donors</p>
                            <p className="stats-card-number">1,248</p>
                            <p className="text-xs text-white/80 flex items-center gap-1 mt-1">
                                <TrendingUp className="w-3 h-3" />
                                +8.3% contributors
                            </p>
                        </div>
                        <Users className="stats-card-icon" />
                    </div>
                </div>

                <div className="stats-card-orange">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="stats-card-label">Avg. Donation</p>
                            <p className="stats-card-number">₹1.57L</p>
                            <p className="text-xs text-white/80 flex items-center gap-1 mt-1">
                                <TrendingUp className="w-3 h-3" />
                                +5.7% per donor
                            </p>
                        </div>
                        <TrendingUp className="stats-card-icon" />
                    </div>
                </div>

                <div className="stats-card-teal">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="stats-card-label">Campaign Goal</p>
                            <p className="stats-card-number">78%</p>
                            <p className="text-xs text-white/80 flex items-center gap-1 mt-1">
                                <Target className="w-3 h-3" />
                                Of ₹2.5Cr target
                            </p>
                        </div>
                        <Target className="stats-card-icon" />
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Active Campaigns */}
                <Card className="lg:col-span-2 bento-card gradient-surface border-card-border/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Target className="h-5 w-5 text-primary" />
                            Active Campaigns
                        </CardTitle>
                        <CardDescription>
                            Current fundraising initiatives from database
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="h-[600px] overflow-hidden">
                        {loading ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                                    <p className="text-muted-foreground">Loading campaigns...</p>
                                </div>
                            </div>
                        ) : error ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center">
                                    <p className="text-destructive mb-2">Error loading campaigns</p>
                                    <p className="text-sm text-muted-foreground">{error}</p>
                                    <Button 
                                        variant="outline" 
                                        onClick={() => window.location.reload()}
                                        className="mt-4"
                                    >
                                        Retry
                                    </Button>
                                </div>
                            </div>
                        ) : campaigns.length === 0 ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center">
                                    <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <p className="text-muted-foreground mb-2">No campaigns found</p>
                                    <p className="text-sm text-muted-foreground">No active campaigns available.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full overflow-y-auto pr-2 space-y-6 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                                {campaigns.map((campaign, index) => (
                                    <div
                                        key={campaign._id}
                                        className="p-4 rounded-lg border border-card-border/50 hover:bg-accent/30 transition-smooth animate-fade-in"
                                        style={{ animationDelay: `${index * 150}ms` }}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-foreground mb-2">{campaign.name}</h3>
                                                <p className="text-sm text-muted-foreground mb-2">
                                                    {campaign.description}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    Created {formatDate(campaign.createdAt || "")}
                                                </p>
                                            </div>
                                            <Badge variant="secondary" className="ml-4">
                                                {getDonorCount(campaign)} donors
                                            </Badge>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Progress</span>
                                                <span className="font-medium text-foreground">
                                                    {formatCurrency(campaign.raised || 0)} of {formatCurrency(campaign.goal)}
                                                </span>
                                            </div>
                                            <div className="w-full bg-secondary rounded-full h-2">
                                                <div
                                                    className="bg-primary h-2 rounded-full transition-all duration-500"
                                                    style={{ width: `${getProgressPercentage(campaign.raised, campaign.goal)}%` }}
                                                />
                                            </div>
                                            <div className="flex justify-between text-xs text-muted-foreground">
                                                <span>{getProgressPercentage(campaign.raised, campaign.goal)}% complete</span>
                                                <span>{formatCurrency(campaign.goal - (campaign.raised || 0))} remaining</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Donations Table - Only visible on large screens */}
                <div className="hidden lg:block">
                    <Card className="bento-card gradient-surface border-card-border/50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ArrowUpRight className="h-5 w-5 text-primary" />
                                Recent Donations
                            </CardTitle>
                            <CardDescription>
                                Latest donations received
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="text-muted-foreground">Donor</TableHead>
                                            <TableHead className="text-muted-foreground">Email</TableHead>
                                            <TableHead className="text-muted-foreground">Amount</TableHead>
                                            <TableHead className="text-muted-foreground">Campaign</TableHead>
                                            <TableHead className="text-muted-foreground">Date</TableHead>
                                            <TableHead className="text-muted-foreground">Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {recentDonations.map((donation) => (
                                            <TableRow key={donation.id}>
                                                <TableCell className="font-medium text-white">
                                                    <div className="flex items-center">
                                                        <Avatar className="mr-3">
                                                            <AvatarImage src={donation.avatar} alt={donation.donor} />
                                                            <AvatarFallback>{donation.donor.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                        {donation.donor}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-white/80">{donation.email}</TableCell>
                                                <TableCell className="text-white/80">{formatCurrency(donation.amount)}</TableCell>
                                                <TableCell className="text-white/80">{donation.campaign}</TableCell>
                                                <TableCell className="text-white/80">{formatDate(donation.date)}</TableCell>
                                                <TableCell>
                                                    {donation.status === "completed" ? (
                                                        <Badge className="bg-success/10 text-success border-success/20">
                                                            Completed
                                                        </Badge>
                                                    ) : donation.status === "pending" ? (
                                                        <Badge variant="outline" className="border-warning text-warning">
                                                            Pending
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="destructive">
                                                            Failed
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
