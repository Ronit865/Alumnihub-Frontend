import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { IndianRupee, TrendingUp, Users, Target, ArrowUpRight, ArrowDownRight, Trophy, Clock, Plus, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { donationService, handleApiError, handleApiSuccess } from "@/services/ApiServices";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";

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
        "avatar": "https://api.dicebear.com/7.x/initials/svg?seed=Rohit+Sharma",
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
        "avatar": "https://api.dicebear.com/7.x/initials/svg?seed=Ananya+Mehta",
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
        "avatar": "https://api.dicebear.com/7.x/initials/svg?seed=Anonymous",
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
        "avatar": "https://api.dicebear.com/7.x/initials/svg?seed=Priya+Nair",
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
        "avatar": "https://api.dicebear.com/7.x/initials/svg?seed=Karan+Patel",
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

interface CreateCampaignForm {
    name: string;
    description: string;
    goal: string;
    endDate: string;
    category: string;
}

export function Donations() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState<CreateCampaignForm>({
        name: "",
        description: "",
        goal: "",
        endDate: "",
        category: ""
    });
    const [formErrors, setFormErrors] = useState<Partial<CreateCampaignForm>>({});
    const { toast: toastHook } = useToast();

    // Get featured campaigns (campaigns that need the least amount to reach their goal)
    const getFeaturedCampaigns = () => {
        return campaigns
            .filter(campaign => (campaign.raised || 0) < campaign.goal) // Only incomplete campaigns
            .sort((a, b) => {
                const remainingA = a.goal - (a.raised || 0);
                const remainingB = b.goal - (b.raised || 0);
                return remainingA - remainingB; // Sort by least remaining amount
            })
            .slice(0, 3); // Take top 3
    };

    // Fetch campaigns from database
    useEffect(() => {
        const fetchCampaigns = async () => {
            try {
                setLoading(true);
                const response = await donationService.getCampaigns();

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
                    toastHook({
                        title: "Error",
                        description: response.message || "Failed to fetch campaigns",
                        variant: "destructive",
                    });
                }
            } catch (err: any) {
                const apiError = handleApiError(err);
                setError(apiError.message || "An error occurred while fetching campaigns");
                toastHook({
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
    }, [toastHook]);

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

    const handleInputChange = (field: keyof CreateCampaignForm, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (formErrors[field]) {
            setFormErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const validateForm = (): boolean => {
        const errors: Partial<CreateCampaignForm> = {};
        
        if (!formData.name.trim()) {
            errors.name = "Campaign name is required";
        }
        
        if (!formData.description.trim()) {
            errors.description = "Description is required";
        }
        
        if (!formData.goal || parseFloat(formData.goal) <= 0) {
            errors.goal = "Please enter a valid goal amount";
        }

        if (!formData.endDate) {
            errors.endDate = "End date is required";
        } else {
            const selectedDate = new Date(formData.endDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (selectedDate <= today) {
                errors.endDate = "End date must be in the future";
            }
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleCreateCampaign = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        try {
            setIsCreating(true);
            
            const campaignData = {
                name: formData.name.trim(),
                description: formData.description.trim(),
                goal: parseFloat(formData.goal),
                endDate: formData.endDate,
                category: formData.category.trim() || undefined
            };

            const response = await donationService.createCampaign(campaignData);
            
            if (response.success) {
                toast.success("Campaign created successfully");
                
                // Reset form and close dialog
                setFormData({
                    name: "",
                    description: "",
                    goal: "",
                    endDate: "",
                    category: ""
                });
                setFormErrors({});
                setIsCreateDialogOpen(false);
                
                // Refresh campaigns list
                window.location.reload();
            } else {
                toast.error(`Failed to create campaign: ${response.message}`);
            }
        } catch (err: any) {
            const errorInfo = handleApiError(err);
            toast.error(`Failed to create campaign: ${errorInfo.message}`);
        } finally {
            setIsCreating(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: "",
            description: "",
            goal: "",
            endDate: "",
            category: ""
        });
        setFormErrors({});
    };

    return (
        <div className="space-y-8">
            {/* Custom Scrollbar Styles */}
            <style>{`
                /* Webkit Scrollbars */
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                    height: 6px;
                }

                .custom-scrollbar::-webkit-scrollbar-track {
                    background: hsl(var(--muted) / 0.3);
                    border-radius: 10px;
                }

                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: hsl(var(--primary) / 0.5);
                    border-radius: 10px;
                    transition: background 0.2s ease;
                }

                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: hsl(var(--primary) / 0.7);
                }

                .custom-scrollbar::-webkit-scrollbar-corner {
                    background: hsl(var(--muted) / 0.3);
                }

                /* Firefox Scrollbars */
                .custom-scrollbar {
                    scrollbar-width: thin;
                    scrollbar-color: hsl(var(--primary) / 0.5) hsl(var(--muted) / 0.3);
                }

                /* Thin Scrollbar Variant */
                .custom-scrollbar-thin::-webkit-scrollbar {
                    width: 4px;
                    height: 4px;
                }

                .custom-scrollbar-thin::-webkit-scrollbar-track {
                    background: hsl(var(--border) / 0.2);
                    border-radius: 8px;
                }

                .custom-scrollbar-thin::-webkit-scrollbar-thumb {
                    background: hsl(var(--accent-foreground) / 0.4);
                    border-radius: 8px;
                    transition: all 0.2s ease;
                }

                .custom-scrollbar-thin::-webkit-scrollbar-thumb:hover {
                    background: hsl(var(--accent-foreground) / 0.6);
                }

                /* Table Scrollbar */
                .table-scrollbar::-webkit-scrollbar {
                    height: 8px;
                }

                .table-scrollbar::-webkit-scrollbar-track {
                    background: hsl(var(--muted) / 0.2);
                    border-radius: 4px;
                    margin: 0 8px;
                }

                .table-scrollbar::-webkit-scrollbar-thumb {
                    background: linear-gradient(90deg, hsl(var(--primary) / 0.6), hsl(var(--primary) / 0.4));
                    border-radius: 4px;
                    transition: all 0.3s ease;
                }

                .table-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(90deg, hsl(var(--primary) / 0.8), hsl(var(--primary) / 0.6));
                    box-shadow: 0 0 8px hsl(var(--primary) / 0.3);
                }
            `}</style>

            {/* Header */}
            <div className="flex justify-between items-start animate-fade-in">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Donation Management</h1>
                    <p className="text-muted-foreground mt-2">
                        Track fundraising campaigns, donations, and donor engagement.
                    </p>
                </div>
                
                {/* Create Campaign Dialog */}
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button 
                            className="gradient-primary text-primary-foreground hover:shadow-purple"
                            onClick={() => setIsCreateDialogOpen(true)}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Create Campaign
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] bento-card gradient-surface border-card-border/50" style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                        <DialogHeader>
                            <DialogTitle className="text-xl font-semibold text-foreground">Create New Campaign</DialogTitle>
                            <DialogDescription className="text-muted-foreground">
                                Start a new fundraising campaign for the alumni community.
                            </DialogDescription>
                        </DialogHeader>
                        
                        <form onSubmit={handleCreateCampaign} className="space-y-6 mt-4">
                            {/* Campaign Name */}
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-sm font-medium text-foreground">
                                    Campaign Name *
                                </Label>
                                <Input
                                    id="name"
                                    placeholder="Enter campaign name"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange("name", e.target.value)}
                                    className={`border-card-border/50 focus:border-primary ${
                                        formErrors.name ? "border-destructive" : ""
                                    }`}
                                />
                                {formErrors.name && (
                                    <p className="text-sm text-destructive">{formErrors.name}</p>
                                )}
                            </div>

                            {/* Campaign Description */}
                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-sm font-medium text-foreground">
                                    Description *
                                </Label>
                                <Textarea
                                    id="description"
                                    placeholder="Describe your campaign goals and purpose"
                                    value={formData.description}
                                    onChange={(e) => handleInputChange("description", e.target.value)}
                                    className={`min-h-[100px] border-card-border/50 focus:border-primary resize-none ${
                                        formErrors.description ? "border-destructive" : ""
                                    }`}
                                />
                                {formErrors.description && (
                                    <p className="text-sm text-destructive">{formErrors.description}</p>
                                )}
                            </div>

                            {/* Goal and End Date Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="goal" className="text-sm font-medium text-foreground">
                                        Goal Amount (₹) *
                                    </Label>
                                    <Input
                                        id="goal"
                                        type="number"
                                        placeholder="100000"
                                        value={formData.goal}
                                        onChange={(e) => handleInputChange("goal", e.target.value)}
                                        className={`border-card-border/50 focus:border-primary ${
                                            formErrors.goal ? "border-destructive" : ""
                                        }`}
                                    />
                                    {formErrors.goal && (
                                        <p className="text-sm text-destructive">{formErrors.goal}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="endDate" className="text-sm font-medium text-foreground">
                                        End Date *
                                    </Label>
                                    <Input
                                        id="endDate"
                                        type="date"
                                        value={formData.endDate}
                                        onChange={(e) => handleInputChange("endDate", e.target.value)}
                                        className={`border-card-border/50 focus:border-primary ${
                                            formErrors.endDate ? "border-destructive" : ""
                                        }`}
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                    {formErrors.endDate && (
                                        <p className="text-sm text-destructive">{formErrors.endDate}</p>
                                    )}
                                </div>
                            </div>

                            {/* Category */}
                            <div className="space-y-2">
                                <Label htmlFor="category" className="text-sm font-medium text-foreground">
                                    Category (Optional)
                                </Label>
                                <Input
                                    id="category"
                                    placeholder="e.g., Scholarship, Infrastructure, Research"
                                    value={formData.category}
                                    onChange={(e) => handleInputChange("category", e.target.value)}
                                    className="border-card-border/50 focus:border-primary"
                                />
                            </div>

                            {/* Form Actions */}
                            <div className="flex justify-end gap-3 pt-4 border-t border-card-border/20">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        resetForm();
                                        setIsCreateDialogOpen(false);
                                    }}
                                    disabled={isCreating}
                                    className="border-card-border/50"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isCreating}
                                    className="gradient-primary text-primary-foreground hover:shadow-purple"
                                >
                                    {isCreating ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Create Campaign
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
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

            {/* Featured Campaigns Section */}
            <Card className="bento-card gradient-surface border-card-border/50 animate-fade-in">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-primary" />
                        Featured Campaigns
                        <Badge variant="secondary" className="ml-2">
                            Priority
                        </Badge>
                    </CardTitle>
                    <CardDescription>
                        Campaigns closest to reaching their goals - need your immediate attention
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center h-40">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                                <p className="text-muted-foreground">Loading featured campaigns...</p>
                            </div>
                        </div>
                    ) : getFeaturedCampaigns().length === 0 ? (
                        <div className="flex items-center justify-center h-40">
                            <div className="text-center">
                                <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground mb-2">No featured campaigns</p>
                                <p className="text-sm text-muted-foreground">All campaigns are either completed or no active campaigns available.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {getFeaturedCampaigns().map((campaign, index) => {
                                const remaining = campaign.goal - (campaign.raised || 0);
                                const daysLeft = campaign.endDate 
                                    ? Math.max(0, Math.ceil((new Date(campaign.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
                                    : null;

                                return (
                                    <div
                                        key={`featured-${campaign._id}`}
                                        className="relative group overflow-hidden rounded-lg border border-card-border/50 bg-gradient-to-br from-card/50 to-card/30 hover:from-card/70 hover:to-card/50 transition-all duration-300 animate-fade-in hover:shadow-lg hover:shadow-primary/10"
                                        style={{ animationDelay: `${index * 200}ms` }}
                                    >
                                        {/* Header with badges */}
                                        <div className="relative p-6 pb-4">
                                            <div className="flex justify-between items-start mb-4">
                                                <Badge className="bg-primary/90 text-primary-foreground">
                                                    Featured
                                                </Badge>
                                                {campaign.category && (
                                                    <Badge variant="secondary" className="bg-background/90">
                                                        {campaign.category}
                                                    </Badge>
                                                )}
                                            </div>
                                            
                                            <h3 className="font-semibold text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
                                                {campaign.name}
                                            </h3>
                                            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                                                {campaign.description}
                                            </p>

                                            {/* Key highlight - remaining amount */}
                                            <div className="bg-primary/5 rounded-lg p-3 border border-primary/20">
                                                <p className="text-xs text-muted-foreground mb-1">Only needs</p>
                                                <p className="font-bold text-lg text-primary">
                                                    {formatCurrency(remaining)}
                                                </p>
                                                <p className="text-xs text-muted-foreground">to reach the goal</p>
                                            </div>
                                        </div>

                                        {/* Progress Section */}
                                        <div className="px-6 pb-4 space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-muted-foreground">Progress</span>
                                                <span className="text-sm font-medium text-foreground">
                                                    {getProgressPercentage(campaign.raised, campaign.goal)}%
                                                </span>
                                            </div>
                                            
                                            {/* Progress Bar */}
                                            <div className="w-full bg-secondary rounded-full h-2">
                                                <div
                                                    className="bg-gradient-to-r from-primary to-primary/80 h-2 rounded-full transition-all duration-500"
                                                    style={{ width: `${getProgressPercentage(campaign.raised, campaign.goal)}%` }}
                                                />
                                            </div>

                                            {/* Stats Grid */}
                                            <div className="grid grid-cols-2 gap-4 pt-2">
                                                <div>
                                                    <p className="font-semibold text-foreground">
                                                        {formatCurrency(campaign.raised || 0)}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">raised</p>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-primary">
                                                        {getDonorCount(campaign)}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">donors</p>
                                                </div>
                                            </div>

                                            {daysLeft !== null && (
                                                <div className="pt-2">
                                                    <Badge 
                                                        variant="outline" 
                                                        className={`${daysLeft < 10 ? 'border-destructive text-destructive' : 'border-primary/50 text-primary'}`}
                                                    >
                                                        {daysLeft} days left
                                                    </Badge>
                                                </div>
                                            )}
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="px-6 pb-6">
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1 border-card-border/50 hover:bg-accent"
                                                >
                                                    View Details
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="flex-1 gradient-primary text-primary-foreground hover:shadow-purple"
                                                >
                                                    Promote
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Active Campaigns - Now takes 2/3 width */}
                <Card className="bento-card gradient-surface border-card-border/50 lg:col-span-2">
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
                            <div className="h-full overflow-y-auto pr-2 space-y-6 custom-scrollbar">
                                {campaigns.map((campaign, index) => (
                                    <div
                                        key={`campaign-${campaign._id}-${index}`}
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

                {/* Top Donors Card - Now takes 1/3 width */}
                <Card className="bento-card gradient-surface border-card-border/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-primary" />
                            Top Donors
                        </CardTitle>
                        <CardDescription>
                            Highest contributors this year
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="h-[600px] overflow-hidden">
                        <div className="h-full overflow-y-auto pr-2 space-y-4 custom-scrollbar-thin">
                            {recentDonations
                                .sort((a, b) => b.amount - a.amount)
                                .slice(0, 10)
                                .map((donation, index) => (
                                <div
                                    key={`top-donor-${donation.id}-${index}`}
                                    className="flex items-center justify-between p-4 rounded-lg border border-card-border/50 hover:bg-accent/30 transition-smooth animate-fade-in"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <Avatar className="w-12 h-12">
                                                <AvatarImage src={donation.avatar} alt={donation.donor} />
                                                <AvatarFallback className="bg-primary/10 text-primary">
                                                    {donation.donor.split(' ').map(n => n[0]).join('')}
                                                </AvatarFallback>
                                            </Avatar>
                                            {index < 3 && (
                                                <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                                                    index === 0 ? 'bg-yellow-500 text-yellow-900' :
                                                    index === 1 ? 'bg-gray-400 text-gray-800' :
                                                    'bg-orange-500 text-orange-900'
                                                }`}>
                                                    {index + 1}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-foreground">{donation.donor}</h4>
                                            <p className="text-sm text-muted-foreground">Class of {donation.class}</p>
                                            <p className="text-xs text-muted-foreground">{donation.campaign}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-lg text-primary">
                                            {formatCurrency(donation.amount)}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatDate(donation.date)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Donations - Full Width Below */}
            <Card className="bento-card gradient-surface border-card-border/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-primary" />
                        Recent Donations
                    </CardTitle>
                    <CardDescription>
                        Latest donation activity across all campaigns
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto table-scrollbar">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Donor</TableHead>
                                    <TableHead>Campaign</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentDonations.map((donation, index) => (
                                    <TableRow 
                                        key={`recent-donation-${donation.id}-${index}`}
                                        className="animate-fade-in hover:bg-accent/30"
                                        style={{ animationDelay: `${index * 100}ms` }}
                                    >
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="w-8 h-8">
                                                    <AvatarImage src={donation.avatar} alt={donation.donor} />
                                                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                                        {donation.donor.split(' ').map(n => n[0]).join('')}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{donation.donor}</p>
                                                    <p className="text-sm text-muted-foreground">{donation.email}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{donation.campaign}</p>
                                                <p className="text-sm text-muted-foreground">Class of {donation.class}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <p className="font-semibold text-primary">
                                                {formatCurrency(donation.amount)}
                                            </p>
                                        </TableCell>
                                        <TableCell>
                                            <p className="text-sm">{formatDate(donation.date)}</p>
                                        </TableCell>
                                        <TableCell>
                                            <Badge 
                                                variant={donation.status === 'completed' ? 'default' : 'secondary'}
                                                className={
                                                    donation.status === 'completed' 
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                                }
                                            >
                                                {donation.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
