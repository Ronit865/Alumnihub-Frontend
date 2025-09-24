import { useState, useEffect } from "react";
import { Calendar, MapPin, Users, Clock, Search, Loader2, CalendarDays } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { eventService } from "@/services/ApiServices";

interface Event {
    _id: string;
    title: string;
    description: string;
    date: string;
    time?: string;
    location?: string;
    type?: string;
    category?: string;
    participants: string[];
    maxAttendees?: number;
    image?: string;
    isactive: boolean;
    createdAt: string;
    updatedAt: string;
}

export default function Events() {
    const [searchQuery, setSearchQuery] = useState("");
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [joiningEvent, setJoiningEvent] = useState<string | null>(null);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await eventService.getEvents();

            if (response.success) {
                // Filter only active events
                const activeEvents = response.data.filter(
                    (event: Event) => event.isactive
                );
                setEvents(activeEvents);
            } else {
                setError(response.message || "Failed to fetch events");
                toast.error("Failed to fetch events");
            }
        } catch (error: any) {
            console.error("Error fetching events:", error);
            setError(error.message || "Failed to fetch events");
            toast.error("Failed to fetch events");
        } finally {
            setLoading(false);
        }
    };

    const handleJoinEvent = async (eventId: string) => {
        try {
            setJoiningEvent(eventId);
            const response = await eventService.joinEvent(eventId);

            if (response.success) {
                toast.success("Successfully registered for event!");
                // Refresh events to update attendee count
                await fetchEvents();
            } else {
                toast.error(response.message || "Failed to join event");
            }
        } catch (error: any) {
            console.error("Error joining event:", error);
            toast.error(error.message || "Failed to join event");
        } finally {
            setJoiningEvent(null);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const getStatusBadge = (isActive: boolean) => {
        if (isActive) {
            return <Badge className="bg-success/10 text-success border-success/20">Active</Badge>;
        } else {
            return <Badge variant="outline" className="border-warning text-warning">Inactive</Badge>;
        }
    };

    const filteredEvents = events.filter((event) =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (event.category && event.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex items-center gap-2">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Loading events...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-6 animate-fade-in">
                <div>
                    <h1 className="text-3xl font-bold gradient-text mb-2">
                        Alumni Events
                    </h1>
                    <p className="text-muted-foreground">
                        Discover upcoming events and connect with fellow alumni
                    </p>
                </div>
                <div className="text-center py-12">
                    <Card className="border-destructive/50 bg-destructive/10">
                        <CardContent className="pt-6">
                            <p className="text-destructive mb-4">{error}</p>
                            <Button onClick={fetchEvents} variant="outline" size="sm">
                                Try Again
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold gradient-text mb-2">
                    Alumni Events
                </h1>
                <p className="text-muted-foreground">
                    Discover upcoming events and connect with fellow alumni
                </p>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Events List */}
            <Card className="bento-card gradient-surface border-card-border/50">
                <CardHeader>
                    <CardTitle>
                        Upcoming Events ({filteredEvents.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {filteredEvents.length === 0 ? (
                            <div className="text-center py-12">
                                <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <p className="text-muted-foreground">
                                    {searchQuery
                                        ? "No events found matching your search."
                                        : "No active events available."}
                                </p>
                            </div>
                        ) : (
                            filteredEvents.map((event, index) => (
                                <Card 
                                    key={event._id} 
                                    className="bento-card hover:shadow-md border-card-border/50 animate-fade-in hover-lift"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                                                        {event.title}
                                                    </h3>
                                                    {getStatusBadge(event.isactive)}
                                                    {event.category && (
                                                        <Badge variant="secondary">{event.category}</Badge>
                                                    )}
                                                </div>
                                                <p className="text-muted-foreground mb-4 line-clamp-2">
                                                    {event.description}
                                                </p>
                                                
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                                                    <div className="flex items-center gap-2">
                                                        <CalendarDays className="h-4 w-4 text-primary" />
                                                        <span>{formatDate(event.date)}</span>
                                                    </div>
                                                    {event.time && (
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="h-4 w-4 text-primary" />
                                                            <span>{event.time}</span>
                                                        </div>
                                                    )}
                                                    {event.location && (
                                                        <div className="flex items-center gap-2">
                                                            <MapPin className="h-4 w-4 text-primary" />
                                                            <span className="truncate">{event.location}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                <div className="flex items-center gap-4 mb-4">
                                                    <div className="flex items-center gap-2">
                                                        <Users className="h-4 w-4 text-primary" />
                                                        <span className="text-sm">
                                                            {event.participants.length} 
                                                            {event.maxAttendees && `/${event.maxAttendees}`} participants
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Registration Progress Bar (if maxAttendees is available) */}
                                                {event.maxAttendees && (
                                                    <div className="space-y-2 mb-4">
                                                        <div className="flex justify-between text-xs text-muted-foreground">
                                                            <span>Registration</span>
                                                            <span>
                                                                {Math.round(
                                                                    (event.participants.length / event.maxAttendees) * 100
                                                                )}
                                                                % full
                                                            </span>
                                                        </div>
                                                        <div className="w-full bg-muted rounded-full h-2">
                                                            <div
                                                                className="bg-primary h-2 rounded-full transition-all duration-300"
                                                                style={{
                                                                    width: `${
                                                                        (event.participants.length / event.maxAttendees) * 100
                                                                    }%`,
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Action Buttons */}
                                                <div className="flex gap-2 pt-2">
                                                    <Button
                                                        size="sm"
                                                        className="gradient-primary text-primary-foreground hover:shadow-purple"
                                                        onClick={() => handleJoinEvent(event._id)}
                                                        disabled={
                                                            joiningEvent === event._id ||
                                                            (event.maxAttendees && event.participants.length >= event.maxAttendees)
                                                        }
                                                    >
                                                        {joiningEvent === event._id ? (
                                                            <>
                                                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                                                Joining...
                                                            </>
                                                        ) : (event.maxAttendees && event.participants.length >= event.maxAttendees) ? (
                                                            "Event Full"
                                                        ) : (
                                                            "Register"
                                                        )}
                                                    </Button>
                                                    <Button size="sm" variant="outline" className="border-card-border/50">
                                                        Learn More
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Load More */}
            {filteredEvents.length > 6 && (
                <div className="text-center pt-6">
                    <Button variant="outline" size="lg" className="border-card-border/50">
                        Load More Events
                    </Button>
                </div>
            )}
        </div>
    );
}