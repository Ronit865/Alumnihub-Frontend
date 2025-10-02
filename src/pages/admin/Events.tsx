import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, Clock, MapPin, Users, Plus, ChevronLeft, ChevronRight, MoreVertical, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { eventService, handleApiError } from "@/services/ApiServices";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  time?: string;
  location?: string;
  participants: string[];
  maxAttendees?: number;
  price?: number;
  isactive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CreateEventForm {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
}

export function Events() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<CreateEventForm>({
    title: "",
    description: "",
    date: "",
    time: "",
    location: ""
  });
  const [formErrors, setFormErrors] = useState<Partial<CreateEventForm>>({});

  // Fetch events from backend
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await eventService.getEvents();
      setEvents(response.data || []);
      setError(null);
    } catch (err: any) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);
      toast.error(`Failed to fetch events: ${errorInfo.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await eventService.deleteEvent(eventId);
      toast.success("Event deleted successfully");
      fetchEvents(); // Refresh the events list
    } catch (err: any) {
      const errorInfo = handleApiError(err);
      toast.error(`Failed to delete event: ${errorInfo.message}`);
    }
  };

  const handleInputChange = (field: keyof CreateEventForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<CreateEventForm> = {};
    
    if (!formData.title.trim()) {
      errors.title = "Title is required";
    }
    
    if (!formData.description.trim()) {
      errors.description = "Description is required";
    }
    
    if (!formData.date) {
      errors.date = "Date is required";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsCreating(true);
      
      const eventData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        date: formData.date,
        time: formData.time || undefined,
        location: formData.location.trim() || undefined
      };

      await eventService.createEvent(eventData);
      toast.success("Event created successfully");
      
      // Reset form and close dialog
      setFormData({
        title: "",
        description: "",
        date: "",
        time: "",
        location: ""
      });
      setFormErrors({});
      setIsCreateDialogOpen(false);
      
      // Refresh events list
      fetchEvents();
    } catch (err: any) {
      const errorInfo = handleApiError(err);
      toast.error(`Failed to create event: ${errorInfo.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      date: "",
      time: "",
      location: ""
    });
    setFormErrors({});
  };

  // Calendar navigation
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const changeMonth = (month: string) => {
    setCurrentDate(new Date(currentDate.getFullYear(), parseInt(month), 1));
  };

  const changeYear = (year: string) => {
    setCurrentDate(new Date(parseInt(year), currentDate.getMonth(), 1));
  };

  // Get calendar days for the current month
  const getCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return events.filter(event => {
      const eventDate = new Date(event.date).toISOString().split('T')[0];
      return eventDate === dateString;
    });
  };

  // Get upcoming events (sorted by date)
  const upcomingEvents = events
    .filter(event => event.isactive && new Date(event.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 10);

  if (loading) {
    return (
      <div className="flex gap-6 h-[calc(100vh-120px)]">
        <div className="flex-1">
          <Skeleton className="h-full rounded-lg" />
        </div>
        <div className="w-80">
          <Skeleton className="h-full rounded-lg" />
        </div>
      </div>
    );
  }

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i);

  return (
    <div className="flex gap-6 h-[calc(100vh-120px)]">
      {/* Calendar Section */}
      <div className="flex-1 flex flex-col">
        <Card className="flex-1 bento-card gradient-surface border-card-border/50">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <CardTitle className="text-2xl">Events</CardTitle>
              
              {/* Create Event Dialog */}
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    className="gradient-primary text-primary-foreground"
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Event
                  </Button>
                </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] bento-card gradient-surface border-card-border/50" style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-foreground">Create New Event</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Fill in the details below to create a new event for the alumni community.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleCreateEvent} className="space-y-6 mt-4">
              {/* Event Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium text-foreground">
                  Event Title *
                </Label>
                <Input
                  id="title"
                  placeholder="Enter event title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className={`border-card-border/50 focus:border-primary ${
                    formErrors.title ? "border-destructive" : ""
                  }`}
                />
                {formErrors.title && (
                  <p className="text-sm text-destructive">{formErrors.title}</p>
                )}
              </div>

              {/* Event Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-foreground">
                  Description *
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe your event"
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

              {/* Date and Time Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-sm font-medium text-foreground">
                    Date *
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange("date", e.target.value)}
                    className={`border-card-border/50 focus:border-primary ${
                      formErrors.date ? "border-destructive" : ""
                    }`}
                  />
                  {formErrors.date && (
                    <p className="text-sm text-destructive">{formErrors.date}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time" className="text-sm font-medium text-foreground">
                    Time
                  </Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => handleInputChange("time", e.target.value)}
                    className="border-card-border/50 focus:border-primary"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm font-medium text-foreground">
                  Location
                </Label>
                <Input
                  id="location"
                  placeholder="Enter event location"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
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
                      Create Event
                    </>
                  )}
                </Button>
              </div>
            </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Month/Year Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Select value={currentDate.getMonth().toString()} onValueChange={changeMonth}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {monthNames.map((month, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={currentDate.getFullYear().toString()} onValueChange={changeYear}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={goToNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1">
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Day headers */}
            {dayNames.map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-muted-foreground pb-2"
              >
                {day.slice(0, 3)}
              </div>
            ))}

            {/* Calendar days */}
            {getCalendarDays().map((day, index) => {
              if (!day) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }

              const dayEvents = getEventsForDate(day);
              const isToday = day.toDateString() === new Date().toDateString();

              return (
                <div
                  key={index}
                  className={`aspect-square rounded-lg p-2 text-sm relative transition-colors ${
                    isToday ? 'bg-primary/20 font-semibold' : ''
                  } ${dayEvents.length > 0 ? 'cursor-pointer hover:bg-accent' : ''}`}
                >
                  <div className="text-xs">{day.getDate()}</div>
                  
                  {/* Event indicators */}
                  {dayEvents.length > 0 && (
                    <div className="mt-1 space-y-1">
                      {dayEvents.slice(0, 3).map((event, idx) => (
                        <div
                          key={event._id}
                          className={`text-xs p-1 rounded truncate ${
                            event.isactive 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-pink-500 text-white'
                          }`}
                          title={event.title}
                        >
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-muted-foreground">
                          +{dayEvents.length - 3} more
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Event List Sidebar */}
    <div className="w-80">
      <Card className="h-full bento-card gradient-surface border-card-border/50 flex flex-col">
        <CardHeader>
          <CardTitle className="text-lg">Event List</CardTitle>
          <CardDescription className="text-xs">
            Lorem ipsum dolor sit amet
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-y-auto space-y-4">
          {upcomingEvents.length === 0 ? (
            <div className="text-center py-8">
              <CalendarDays className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No upcoming events</p>
            </div>
          ) : (
            upcomingEvents.map((event) => {
              const participantsCount = event.participants.length;
              const maxAttendees = event.maxAttendees || 100;
              const ticketsLeft = maxAttendees - participantsCount;
              const progress = (participantsCount / maxAttendees) * 100;

              return (
                <div
                  key={event._id}
                  className="border-b border-card-border/20 pb-4 last:border-0"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground mb-1">
                        {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                      <h4 className="font-semibold text-sm mb-1">{event.title}</h4>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{event.time || '07:00 - 10:00 PM'}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-semibold text-sm">
                        ${event.price?.toFixed(1) || '5.0'}
                      </span>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Progress value={progress} className="h-1" />
                    <p className="text-xs text-muted-foreground">
                      {ticketsLeft} ticket left
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  </div>
  );
}