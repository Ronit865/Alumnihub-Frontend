import { useState } from "react";
import { Send, MessageSquare, Mail, Bell, Users, Plus, TrendingUp, Flame, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RedditPostCard } from "@/components/communication/RedditPostCard";
import { PostComposer } from "@/components/communication/PostComposer";

const messages = [
  {
    id: 1,
    user: "Priya Sharma '18",
    message: "Looking for mentorship opportunities in AI/ML. Would love to connect with alumni in this field! I'm particularly interested in computer vision and natural language processing. Currently working on a startup idea and would appreciate any guidance from experienced professionals.",
    timestamp: "2 hours ago",
    replies: 15,
    category: "Mentorship",
    upvotes: 45,
    downvotes: 2
  },
  {
    id: 2,
    user: "Arjun Patel '15", 
    message: "Hosting a fintech startup meetup next month in Mumbai. Alumni in finance welcome to join! We'll be discussing the latest trends in digital banking, crypto, and payment solutions. Great networking opportunity!",
    timestamp: "4 hours ago",
    replies: 23,
    category: "Events",
    upvotes: 67,
    downvotes: 5
  },
  {
    id: 3,
    user: "Kavya Reddy '20",
    message: "Just published a research paper on biomedical engineering applications in prosthetics. Happy to discuss with fellow researchers and share insights about the latest developments in the field.",
    timestamp: "1 day ago",
    replies: 12,
    category: "Research", 
    upvotes: 34,
    downvotes: 1
  },
  {
    id: 4,
    user: "Rohan Singh '16",
    message: "Our marketing agency is expanding! Looking for talented alumni to join our team. We're specifically looking for digital marketing specialists, content creators, and data analysts. Great company culture and competitive benefits.",
    timestamp: "2 days ago",
    replies: 28,
    category: "Jobs",
    upvotes: 89,
    downvotes: 7
  },
  {
    id: 5,
    user: "Ananya Gupta '19",
    message: "Successfully raised Series A funding for my EdTech startup! AMA about the fundraising process, pitching to VCs, and building a product-market fit. Happy to share lessons learned.",
    timestamp: "3 days ago",
    replies: 42,
    category: "Alumni Stories",
    upvotes: 156,
    downvotes: 3
  }
];

const notifications = [
  {
    id: 1,
    title: "Priya Sharma replied to your post",
    message: "Thanks for the mentorship advice! I'd love to connect and discuss further.",
    timestamp: "1 hour ago",
    type: "reply",
    read: false
  },
  {
    id: 2,
    title: "Arjun Patel started a new thread",
    message: "Looking for co-founders for my new fintech startup - anyone interested?",
    timestamp: "2 hours ago",
    type: "thread",
    read: false
  },
  {
    id: 3,
    title: "Kavya Reddy replied to you",
    message: "Great question about biomedical research! Here's my perspective...",
    timestamp: "5 hours ago",
    type: "reply",
    read: true
  },
  {
    id: 4,
    title: "Rohan Singh mentioned you in a post",
    message: "Tagging @AlumniDave for insights on marketing strategy for startups",
    timestamp: "8 hours ago",
    type: "mention",
    read: true
  },
  {
    id: 5,
    title: "Ananya Gupta started a new discussion",
    message: "Anyone attending the upcoming Alumni Tech Summit? Let's plan a meetup!",
    timestamp: "1 day ago",
    type: "thread",
    read: true
  },
  {
    id: 6,
    title: "5 people liked your comment",
    message: "Your comment on 'Career transition tips' received multiple likes",
    timestamp: "2 days ago",
    type: "like",
    read: true
  }
];

export default function Communications() {
  const [newMessage, setNewMessage] = useState("");

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Communications</h1>
          <p className="text-muted-foreground">
            Stay connected with the alumni community
          </p>
        </div>
       
      </div>

      <Tabs defaultValue="community" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList className="grid max-w-md grid-cols-2">
            <TabsTrigger value="community" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              Community
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </TabsTrigger>
          </TabsList>
          
          {/* Sort Options */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="gap-2">
              <Flame className="w-4 h-4" />
              Hot
            </Button>
            <Button variant="ghost" size="sm" className="gap-2">
              <Clock className="w-4 h-4" />
              New
            </Button>
          </div>
        </div>

        <TabsContent value="community" className="space-y-6">
          {/* Post Composer */}
          <PostComposer />

          {/* Community Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-orange-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Posts</p>
                    <p className="text-2xl font-bold">1,234</p>
                  </div>
                  <MessageSquare className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                    <p className="text-2xl font-bold">567</p>
                  </div>
                  <Users className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Comments</p>
                    <p className="text-2xl font-bold">3,456</p>
                  </div>
                  <MessageSquare className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Upvotes</p>
                    <p className="text-2xl font-bold">12,789</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Messages Feed */}
          <div className="space-y-4">
            {messages.map((message) => (
              <RedditPostCard
                key={message.id}
                id={message.id}
                user={message.user}
                message={message.message}
                timestamp={message.timestamp}
                replies={message.replies}
                category={message.category}
                upvotes={message.upvotes}
                downvotes={message.downvotes}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Recent Notifications
              </CardTitle>
              <CardDescription>Stay updated with important announcements and activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${
                      !notification.read ? 'bg-primary/5 border-primary/20' : 'bg-muted/30'
                    }`}
                  >
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-medium mb-1">{notification.title}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{notification.timestamp}</span>
                        <Badge variant="secondary">{notification.type}</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="broadcasts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                Email Broadcasts
              </CardTitle>
              <CardDescription>Send announcements to alumni groups</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject</label>
                  <Input placeholder="Enter email subject..." />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Recipient Group</label>
                  <select className="w-full p-2 border rounded-md">
                    <option>All Alumni</option>
                    <option>Class of 2020</option>
                    <option>Class of 2019</option>
                    <option>Technology Alumni</option>
                    <option>Business Alumni</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Message Content</label>
                <Textarea 
                  placeholder="Write your announcement..."
                  className="min-h-[150px]"
                />
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Save Draft</Button>
                  <Button variant="outline" size="sm">Preview</Button>
                </div>
                <Button className="gap-2">
                  <Send className="w-4 h-4" />
                  Send Broadcast
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Broadcasts */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Broadcasts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    subject: "Alumni Tech Summit 2024 - Registration Open",
                    recipients: "All Alumni",
                    sent: "2 days ago",
                    opens: "68%"
                  },
                  {
                    subject: "Scholarship Fund Update - 85% Goal Reached",
                    recipients: "Donors",
                    sent: "1 week ago",
                    opens: "72%"
                  },
                  {
                    subject: "New Job Opportunities from Alumni Network",
                    recipients: "Recent Graduates",
                    sent: "2 weeks ago",
                    opens: "65%"
                  }
                ].map((broadcast, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div>
                      <h4 className="font-medium">{broadcast.subject}</h4>
                      <p className="text-sm text-muted-foreground">
                        Sent to {broadcast.recipients} • {broadcast.sent}
                      </p>
                    </div>
                    <Badge variant="secondary">{broadcast.opens} open rate</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}