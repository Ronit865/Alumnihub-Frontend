import { Heart, TrendingUp, Users, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BentoCard } from "@/components/ui/bento-card";
import { useEffect, useState } from "react";
import { donationService, handleApiError } from "@/services/ApiServices";

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
  category?: string;
}

export default function Donations() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        const response = await donationService.getCampaigns();
        
        console.log('API Response:', response);
        console.log('Campaign data:', response.data);

         if (response.success) {
          // Process campaigns to handle the schema differences
          const processedCampaigns = (response.data || []).map((campaign: any) => {
            // Handle raised amount - prioritize 'raised' over 'raisedAmount'
            const raisedAmount = campaign.raised || campaign.raisedAmount || 0;
            
            // Handle donors count with multiple fallbacks
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

            console.log(`Campaign ${campaign.name}:`, {
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
          console.error("Failed to fetch campaigns:", response.message);
        }
      } catch (err: any) {
        const errorInfo = handleApiError(err);
        setError(errorInfo.message);
        console.error("Error fetching campaigns:", errorInfo.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  const totalRaised = campaigns.reduce((sum, campaign) => sum + (campaign.raised || 0), 0);
  const totalDonors = campaigns.reduce((sum, campaign) => {
    const donors = typeof campaign.donors === 'number' ? campaign.donors : 0;
    return sum + donors;
  }, 0);
  const totalGoal = campaigns.reduce((sum, campaign) => sum + campaign.goal, 0);
  const completedCampaigns = campaigns.filter(c => (c.raised || 0) >= c.goal).length;

  const featuredCampaign = campaigns.length > 0 ?
    campaigns.reduce((max, campaign) => {
      const currentProgress = ((campaign.raised || 0) / campaign.goal) * 100;
      const maxProgress = ((max.raised || 0) / max.goal) * 100;
      return currentProgress > maxProgress ? campaign : max;
    }) : null;

  // Format currency for Indian Rupees
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getDaysLeft = (endDate?: string) => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Donations & Impact</h1>
          <p className="text-muted-foreground">
            Make a difference in the lives of current and future students
          </p>
        </div>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading campaigns...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && campaigns.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Donations & Impact</h1>
          <p className="text-muted-foreground">
            Make a difference in the lives of current and future students
          </p>
        </div>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="text-destructive mb-4">
              <Heart className="h-12 w-12 mx-auto mb-2 opacity-50" />
            </div>
            <p className="text-destructive mb-4">Error loading campaigns</p>
            <p className="text-muted-foreground text-sm mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold gradient-text mb-2">Donations & Impact</h1>
        <p className="text-muted-foreground">
          Make a difference in the lives of current and future students
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Raised</p>
                <p className="text-2xl font-bold">
                  {totalRaised > 0 ? formatCurrency(totalRaised) : "₹0"}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Donors</p>
                <p className="text-2xl font-bold">{totalDonors}</p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Campaigns</p>
                <p className="text-2xl font-bold">{campaigns.length}</p>
              </div>
              <Target className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed Goals</p>
                <p className="text-2xl font-bold">{completedCampaigns}</p>
              </div>
              <Heart className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Featured Campaign */}
      {featuredCampaign && (
        <BentoCard
          title="Featured Campaign"
          description="Our most urgent fundraising priority"
          size="xl"
          gradient
        >
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">{featuredCampaign.name}</h3>
              <p className="text-muted-foreground">
                {featuredCampaign.description}
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="font-medium">
                  {formatCurrency(featuredCampaign.raised || 0)} raised
                </span>
                <span className="text-muted-foreground">
                  Goal: {formatCurrency(featuredCampaign.goal)}
                </span>
              </div>
              <Progress
                value={((featuredCampaign.raised || 0) / featuredCampaign.goal) * 100}
                className="h-3"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{featuredCampaign.donors || 0} donors</span>
                {featuredCampaign.endDate && (
                  <span>{getDaysLeft(featuredCampaign.endDate)} days left</span>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <Button size="lg" className="flex-1">
                Donate Now
              </Button>
              <Button size="lg" variant="outline" className="flex-1">
                Learn More
              </Button>
            </div>
          </div>
        </BentoCard>
      )}

      {/* Active Campaigns */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          Active Campaigns {campaigns.length > 0 && `(${campaigns.length})`}
        </h2>

        {campaigns.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">No Active Campaigns</h3>
              <p className="text-muted-foreground mb-4">
                There are currently no active donation campaigns. Check back later for new opportunities to make a difference.
              </p>
              <Button variant="outline">
                Contact Us About Donations
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => {
              const progress = ((campaign.raised || 0) / campaign.goal) * 100;
              const daysLeft = getDaysLeft(campaign.endDate);

              return (
                <Card key={campaign._id} className="hover-lift group">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="group-hover:text-primary transition-colors">
                          {campaign.name}
                        </CardTitle>
                        <CardDescription className="mt-2">
                          {campaign.description}
                        </CardDescription>
                      </div>
                      {campaign.category && (
                        <Badge variant="secondary">{campaign.category}</Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">
                          {formatCurrency(campaign.raised || 0)}
                        </span>
                        <span className="text-muted-foreground">
                          of {formatCurrency(campaign.goal)}
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
                      <div className="text-center text-xs text-muted-foreground">
                        {progress.toFixed(1)}% complete
                      </div>
                    </div>

                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{campaign.donors || 0} donors</span>
                      {daysLeft !== null && (
                        <span>
                          {daysLeft > 0 ? `${daysLeft} days left` : 'Campaign ended'}
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        disabled={daysLeft === 0}
                      >
                        {daysLeft === 0 ? 'Ended' : 'Donate'}
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        Share
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Impact Stories */}
      <Card>
        <CardHeader>
          <CardTitle>Impact Stories</CardTitle>
          <CardDescription>See how your donations are making a difference</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div key="anjali-patel" className="space-y-3">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-lg font-medium text-primary">AP</span>
              </div>
              <div>
                <h4 className="font-semibold">Anjali Patel, Class of 2023</h4>
                <p className="text-sm text-muted-foreground">
                  "The scholarship fund helped me pursue my B.Tech in Computer Science despite financial hardships. 
                  Today, I work at TCS and support my family. This opportunity transformed our lives completely."
                </p>
              </div>
            </div>

            <div key="rahul-kumar" className="space-y-3">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-lg font-medium text-primary">RK</span>
              </div>
              <div>
                <h4 className="font-semibold">Rahul Kumar, Class of 2022</h4>
                <p className="text-sm text-muted-foreground">
                  "During COVID-19, when my father lost his job, the emergency aid program ensured I could continue my MBA. 
                  Now I'm working at Infosys and contributing back to help other students like me."
                </p>
              </div>
            </div>

            <div key="priya-sharma" className="space-y-3">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-lg font-medium text-primary">PS</span>
              </div>
              <div>
                <h4 className="font-semibold">Priya Sharma, Class of 2021</h4>
                <p className="text-sm text-muted-foreground">
                  "Coming from a small village in Rajasthan, I never imagined studying engineering. 
                  The merit-cum-means scholarship made my dream possible. I now work at Microsoft and mentor rural students."
                </p>
              </div>
            </div>

            <div key="arjun-singh" className="space-y-3">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-lg font-medium text-primary">AS</span>
              </div>
              <div>
                <h4 className="font-semibold">Arjun Singh, Class of 2020</h4>
                <p className="text-sm text-muted-foreground">
                  "The laptop donation program during lockdown ensured I didn't miss online classes. 
                  Today, as a software developer at Wipro, I donate laptops for underprivileged students every year."
                </p>
              </div>
            </div>

            <div key="meera-gupta" className="space-y-3">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-lg font-medium text-primary">MG</span>
              </div>
              <div>
                <h4 className="font-semibold">Meera Gupta, Class of 2024</h4>
                <p className="text-sm text-muted-foreground">
                  "The women empowerment fund supported my research project on sustainable agriculture. 
                  This helped me secure admission to IIT for my PhD and I'm now working on solutions for Indian farmers."
                </p>
              </div>
            </div>

            <div key="vikram-tiwari" className="space-y-3">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-lg font-medium text-primary">VT</span>
              </div>
              <div>
                <h4 className="font-semibold">Vikram Tiwari, Class of 2019</h4>
                <p className="text-sm text-muted-foreground">
                  "The skill development fund helped me learn advanced programming languages and secure a placement at Accenture. 
                  I've established a coding bootcamp in my hometown to train rural youth in technology."
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}