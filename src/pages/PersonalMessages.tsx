import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Send, Search, Phone, Video, MoreVertical, Pin, Star, Archive, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { messageService, userService } from "@/services/ApiServices";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface User {
  _id: string;
  name: string;
  avatar?: string;
  email: string;
  currentPosition?: string;
  graduationYear?: string;
}

interface Message {
  _id: string;
  sender: User;
  content: string;
  createdAt: string;
  read: boolean;
}

interface Conversation {
  _id: string;
  participant: User;
  lastMessage?: {
    content: string;
    createdAt: string;
    sender: string;
    read: boolean;
  };
  lastMessageTime?: string;
}

export default function PersonalMessages() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  // Handle incoming userId from navigation (e.g., from Alumni page Message button)
  useEffect(() => {
    const userId = location.state?.userId;
    if (userId) {
      // Create or get conversation with this user
      const createConversationWithUser = async () => {
        try {
          const response = await messageService.getOrCreateConversation(userId);
          const newConversation = response.data.data;
          
          // Add to conversations list if not already there
          setConversations(prev => {
            const exists = prev.find(c => c._id === newConversation._id);
            if (exists) return prev;
            return [newConversation, ...prev];
          });
          
          // Select this conversation
          setSelectedConversation(newConversation);
        } catch (error: any) {
          toast({
            variant: "destructive",
            title: "Error",
            description: error.response?.data?.message || "Failed to create conversation"
          });
        }
      };
      
      createConversationWithUser();
      // Clear the state
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state?.userId]);

  // Fetch current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await userService.getCurrentUser();
        setCurrentUser(response.data.data);
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };
    fetchCurrentUser();
  }, []);

  // Fetch conversations
  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await messageService.getUserConversations();
      setConversations(response.data.data);
      
      // Select first conversation if exists
      if (response.data.data.length > 0 && !selectedConversation) {
        setSelectedConversation(response.data.data[0]);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch conversations"
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation._id);
    }
  }, [selectedConversation]);

  const fetchMessages = async (conversationId: string) => {
    try {
      setLoadingMessages(true);
      const response = await messageService.getConversationMessages(conversationId, { limit: 50 });
      setMessages(response.data.data.messages);
      
      // Mark as read
      await messageService.markMessagesAsRead(conversationId);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch messages"
      });
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      setSendingMessage(true);
      const response = await messageService.sendMessage(selectedConversation._id, newMessage.trim());
      
      // Add message to current messages
      setMessages(prev => [...prev, response.data.data]);
      setNewMessage("");
      
      // Update conversation list
      fetchConversations();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to send message"
      });
    } finally {
      setSendingMessage(false);
    }
  };

  const getTimeAgo = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return date;
    }
  };

  const getMessageTime = (date: string) => {
    try {
      return new Date(date).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return date;
    }
  };

  const filteredConversations = (conversations || []).filter(conv =>
    conv.participant?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold gradient-text mb-2">Personal Messages</h1>
        <p className="text-muted-foreground">
          Connect and communicate with fellow alumni
        </p>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center h-[700px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : !conversations || conversations.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No conversations yet. Connect with alumni to start messaging!</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[700px]">
          {/* Conversations List */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Conversations</h2>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[580px]">
                <div className="space-y-1 p-3">
                  {filteredConversations.map((conversation) => (
                    <div
                      key={conversation._id}
                      onClick={() => setSelectedConversation(conversation)}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-accent/80 ${
                        selectedConversation?._id === conversation._id 
                          ? "bg-primary/10 border-l-4 border-l-primary" 
                          : "hover:shadow-sm"
                      }`}
                    >
                      <div className="relative">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={conversation.participant?.avatar} />
                          <AvatarFallback className="bg-primary/20 text-primary font-medium">
                            {conversation.participant?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <h3 className="font-medium text-sm truncate">
                              {conversation.participant?.name}
                              {conversation.participant?.graduationYear && typeof conversation.participant.graduationYear === 'string' && ` '${conversation.participant.graduationYear.slice(-2)}`}
                            </h3>
                          </div>
                          {conversation.lastMessageTime && (
                            <span className="text-xs text-muted-foreground">
                              {getTimeAgo(conversation.lastMessageTime).replace(' ago', '')}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground truncate">
                            {conversation.lastMessage?.content || "Start a conversation"}
                          </p>
                          {conversation.lastMessage && 
                           !conversation.lastMessage.read && 
                           conversation.lastMessage.sender !== currentUser?._id && (
                            <div className="w-2 h-2 bg-primary rounded-full" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat Area */}
          {selectedConversation ? (
            <Card className="lg:col-span-2 flex flex-col">
              {/* Chat Header */}
              <CardHeader className="pb-3 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={selectedConversation.participant?.avatar} />
                        <AvatarFallback className="bg-primary/20 text-primary font-medium">
                          {selectedConversation.participant?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{selectedConversation.participant?.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedConversation.participant?.currentPosition || "Active now"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Video className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Star className="w-4 h-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Pin className="mr-2 h-4 w-4" />
                          Pin conversation
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Archive className="mr-2 h-4 w-4" />
                          Archive
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                {loadingMessages ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => {
                      const isMe = message.sender._id === currentUser?._id;
                      return (
                        <div
                          key={message._id}
                          className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                        >
                          <div className={`flex gap-2 max-w-[70%] ${isMe ? "flex-row-reverse" : ""}`}>
                            {!isMe && (
                              <div className="relative">
                                <Avatar className="w-8 h-8">
                                  <AvatarImage src={message.sender.avatar} />
                                  <AvatarFallback className="bg-primary/20 text-primary text-xs">
                                    {message.sender.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-background rounded-full"></div>
                              </div>
                            )}
                            <div className={`rounded-2xl px-4 py-3 shadow-sm ${
                              isMe 
                                ? "bg-primary text-primary-foreground" 
                                : "bg-card border border-border"
                            }`}>
                              <p className="text-sm">{message.content}</p>
                              <p className={`text-xs mt-1 ${
                                isMe 
                                  ? "text-primary-foreground/70" 
                                  : "text-muted-foreground"
                              }`}>
                                {getMessageTime(message.createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>

              <Separator />

              {/* Message Input */}
              <div className="p-4">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && !sendingMessage && handleSendMessage()}
                    disabled={sendingMessage}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sendingMessage}
                    size="icon"
                  >
                    {sendingMessage ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="lg:col-span-2 flex items-center justify-center">
              <p className="text-muted-foreground">Select a conversation to start messaging</p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}