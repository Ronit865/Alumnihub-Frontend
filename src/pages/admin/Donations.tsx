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
                {donationStats.map((stat, index) => (
                    <Card
                        key={stat.title}
                        className="bento-card bento-card-hover gradient-subtle border-card-border/50"
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {stat.title}
                            </CardTitle>
                            <stat.icon className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                            <div className="flex items-center space-x-2 text-xs">
                                <Badge
                                    variant={stat.changeType === "increase" ? "default" : "destructive"}
                                    className="bg-success/10 text-success border-success/20"
                                >
                                    {stat.changeType === "increase" ? (
                                        <ArrowUpRight className="h-3 w-3 mr-1" />
                                    ) : (
                                        <ArrowDownRight className="h-3 w-3 mr-1" />
                                    )}
                                    {stat.change}
                                </Badge>
                                <span className="text-muted-foreground">{stat.description}</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
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
                                            <Badge className="bg-primary/10 text-primary border-primary/20 ml-4">
                                                {getDonorCount(campaign)} donors
                                            </Badge>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Progress</span>
                                                <span className="font-medium">
                                                    {formatCurrency(campaign.raised || 0)} of {formatCurrency(campaign.goal)}
                                                </span>
                                            </div>
                                            <div className="w-full bg-muted rounded-full h-2">
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

                {/* Top Donors */}
                <Card className="bento-card gradient-surface border-card-border/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary" />
                            Top Donors
                        </CardTitle>
                        <CardDescription>
                            Largest contributors this year
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentDonations.slice(0, 5).map((donation, index) => (
                                <div
                                    key={donation.id}
                                    className="flex items-center gap-3 animate-fade-in"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={donation.avatar} alt={donation.donor} />
                                        <AvatarFallback className="bg-primary/10 text-primary">
                                            {donation.donor.split(" ").map((n) => n[0]).join("")}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <p className="font-medium text-foreground">{donation.donor}</p>
                                        <p className="text-sm text-muted-foreground">Class of {donation.class}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-foreground">{formatCurrency(donation.amount)}</p>
                                        <p className="text-xs text-muted-foreground">{donation.campaign}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Donations Table */}
            <Card className="bento-card gradient-surface border-card-border/50">
                <CardHeader>
                    <CardTitle>Recent Donations</CardTitle>
                    <CardDescription>
                        Latest donation transactions and their status
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Donor</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Campaign</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentDonations.map((donation, index) => (
                                <TableRow
                                    key={donation.id}
                                    className="hover:bg-accent/30 transition-smooth animate-fade-in"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={donation.avatar} alt={donation.donor} />
                                                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                                    {donation.donor.split(" ").map((n) => n[0]).join("")}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium text-foreground">{donation.donor}</p>
                                                <p className="text-sm text-muted-foreground">Class of {donation.class}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-semibold">
                                        {formatCurrency(donation.amount)}
                                    </TableCell>
                                    <TableCell>{donation.campaign}</TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {new Date(donation.date).toLocaleDateString('en-IN')}
                                    </TableCell>
                                    <TableCell>
                                        {getStatusBadge(donation.status)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
