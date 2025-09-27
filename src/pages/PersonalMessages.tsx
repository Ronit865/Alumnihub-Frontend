import { useState } from "react";
import { Send, Search, Phone, Video, MoreVertical, Pin, Star, Archive, Check, CheckCheck, Smile, Paperclip, Camera, Mic } from "lucide-react";
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

const conversations = [
  {
    id: 1,
    name: "Priya Sharma '18",
    avatar: "",
    lastMessage: "Thanks for the mentorship advice!",
    time: "2m ago",
    unread: 2,
    online: true,
    pinned: true,
  },
  {
    id: 2,
    name: "Arjun Patel '15",
    avatar: "",
    lastMessage: "Looking forward to the meetup",
    time: "15m ago",
    unread: 0,
    online: true,
    pinned: false,
  },
  {
    id: 3,
    name: "Kavya Reddy '20",
    avatar: "",
    lastMessage: "Great insights on the research paper",
    time: "1h ago",
    unread: 1,
    online: false,
    pinned: false,
  },
  {
    id: 4,
    name: "Rohan Singh '16",
    avatar: "",
    lastMessage: "Let's discuss the startup idea",
    time: "3h ago",
    unread: 0,
    online: false,
    pinned: false,
  },
  {
    id: 5,
    name: "Ananya Gupta '19",
    avatar: "",
    lastMessage: "Thanks for connecting!",
    time: "1d ago",
    unread: 0,
    online: false,
    pinned: false,
  },
];

const messages = [
  {
    id: 1,
    sender: "Priya Sharma '18",
    content: "Hi! I hope you're doing well. I wanted to reach out about the mentorship program.",
    time: "10:30 AM",
    isMe: false,
    status: "delivered",
  },
  {
    id: 2,
    sender: "Me",
    content: "Hello Priya! Great to hear from you. I'd be happy to help with the mentorship program. What specific areas are you interested in?",
    time: "10:32 AM",
    isMe: true,
    status: "read",
  },
  {
    id: 3,
    sender: "Priya Sharma '18",
    content: "I'm particularly interested in career development in the tech industry. Your background in software engineering would be perfect for guidance.",
    time: "10:35 AM",
    isMe: false,
    status: "delivered",
  },
  {
    id: 4,
    sender: "Me",
    content: "That sounds great! I'd love to share my experience. How about we schedule a call this week?",
    time: "10:37 AM",
    isMe: true,
    status: "read",
  },
  {
    id: 5,
    sender: "Priya Sharma '18",
    content: "Thanks for connecting! Looking forward to the mentorship session.",
    time: "10:40 AM",
    isMe: false,
    status: "delivered",
  },
  {
    id: 6,
    sender: "Me",
    content: "Perfect! Let me know your availability and we'll set something up. 📅",
    time: "10:42 AM",
    isMe: true,
    status: "sent",
  },
];

export default function PersonalMessages() {
  const [selectedConversation, setSelectedConversation] = useState(conversations[0]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // In a real app, this would send the message to the server
      setNewMessage("");
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
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

      {/* Messages Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 h-[700px] rounded-lg overflow-hidden border border-border">
        {/* Conversations List */}
        <div className="lg:col-span-1 bg-card border-r border-border">
          <div className="p-4 bg-green-600 text-white">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-lg">Chats</h2>
              <Button variant="ghost" size="icon" className="text-white hover:bg-green-700">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </div>
            <div className="relative mt-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-200 w-4 h-4" />
              <Input
                placeholder="Search or start new chat"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-green-500/30 border-green-500 text-white placeholder:text-green-200 focus:bg-green-500/20"
              />
            </div>
          </div>
          <ScrollArea className="h-[620px]">
            <div className="space-y-0">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation)}
                  className={`flex items-center gap-3 p-4 cursor-pointer transition-colors hover:bg-accent/50 border-b border-border/50 ${
                    selectedConversation.id === conversation.id 
                      ? "bg-green-50 border-l-4 border-l-green-500" 
                      : ""
                  }`}
                >
                  <div className="relative">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={conversation.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-green-400 to-green-600 text-white font-medium">
                        {conversation.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    {conversation.online && (
                      <div className="absolute -bottom-0 -right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-foreground truncate">{conversation.name}</h3>
                      <div className="flex items-center gap-1">
                        {conversation.pinned && <Pin className="w-3 h-3 text-muted-foreground" />}
                        <span className="text-xs text-muted-foreground">{conversation.time}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</p>
                      {conversation.unread > 0 && (
                        <div className="bg-green-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-medium">
                          {conversation.unread}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2 flex flex-col bg-gradient-to-b from-green-50 to-green-100/30">
          {/* Chat Header */}
          <div className="p-4 bg-card border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={selectedConversation.avatar} />
                  <AvatarFallback className="bg-gradient-to-br from-green-400 to-green-600 text-white font-medium">
                    {selectedConversation.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                {selectedConversation.online && (
                  <div className="absolute -bottom-0 -right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{selectedConversation.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedConversation.online ? "online" : `last seen ${selectedConversation.time}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <Phone className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <Video className="w-5 h-5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                    <MoreVertical className="w-5 h-5" />
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

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-3">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex ${message.isMe ? "justify-end" : "justify-start"}`}
                >
                  <div className={`relative max-w-[70%] ${message.isMe ? "ml-12" : "mr-12"}`}>
                    <div className={`rounded-lg px-3 py-2 shadow-sm ${
                      message.isMe 
                        ? "bg-green-500 text-white" 
                        : "bg-white border border-border"
                    }`}>
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      <div className={`flex items-center gap-1 justify-end mt-1 ${
                        message.isMe ? "text-green-100" : "text-muted-foreground"
                      }`}>
                        <span className="text-xs">{message.time}</span>
                        {message.isMe && (
                          <div className="flex">
                            {message.status === "sent" && <Check className="w-3 h-3" />}
                            {message.status === "delivered" && <CheckCheck className="w-3 h-3" />}
                            {message.status === "read" && <CheckCheck className="w-3 h-3 text-blue-300" />}
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Message tail */}
                    <div className={`absolute top-0 w-0 h-0 ${
                      message.isMe 
                        ? "right-0 border-l-8 border-l-green-500 border-t-8 border-t-transparent border-b-8 border-b-transparent" 
                        : "left-0 border-r-8 border-r-white border-t-8 border-t-transparent border-b-8 border-b-transparent"
                    }`} style={{
                      right: message.isMe ? "-8px" : "auto",
                      left: message.isMe ? "auto" : "-8px"
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="p-4 bg-card border-t border-border">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                  <Smile className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                  <Paperclip className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="flex-1 relative">
                <Input
                  placeholder="Type a message"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  className="pr-12 rounded-full border-border focus:border-green-500 bg-background"
                />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <Camera className="w-4 h-4" />
                </Button>
              </div>
              
              {newMessage.trim() ? (
                <Button 
                  onClick={handleSendMessage}
                  size="icon"
                  className="bg-green-600 hover:bg-green-700 text-white rounded-full w-10 h-10"
                >
                  <Send className="w-4 h-4" />
                </Button>
              ) : (
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                  <Mic className="w-5 h-5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}