import { useState, useEffect, useRef } from "react";
import { Send, X, MoreVertical, Loader2, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { messageService, userService } from "@/services/ApiServices";
import { useToast } from "@/hooks/use-toast";
import { containsInappropriateContent } from "@/lib/contentFilter";

interface ChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId?: string;
  conversationId?: string;
  participantName?: string;
  participantAvatar?: string;
}

interface Message {
  _id: string;
  sender: {
    _id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  createdAt: string;
  read: boolean;
}

export function ChatDialog({ 
  open, 
  onOpenChange, 
  userId, 
  conversationId: initialConversationId,
  participantName,
  participantAvatar 
}: ChatDialogProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [conversationId, setConversationId] = useState(initialConversationId);
  const [participant, setParticipant] = useState({ name: participantName, avatar: participantAvatar });
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior });
    }
  };

  // Fetch current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await userService.getCurrentUser();
        const userData = response?.data?.data || response?.data || response;
        setCurrentUser(userData);
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };
    fetchCurrentUser();
  }, []);

  // Create or get conversation when dialog opens
  useEffect(() => {
    if (open && userId && !initialConversationId) {
      createConversation();
    } else if (open && initialConversationId) {
      fetchMessages();
    }
  }, [open, userId, initialConversationId]);

  const createConversation = async () => {
    try {
      setLoading(true);
      const response = await messageService.getOrCreateConversation(userId!);
      const conv = response?.data;
      if (conv) {
        setConversationId(conv._id);
        setParticipant({
          name: conv.participants?.find((p: any) => p._id !== currentUser?._id)?.name || participantName,
          avatar: conv.participants?.find((p: any) => p._id !== currentUser?._id)?.avatar || participantAvatar
        });
        await fetchMessagesForConversation(conv._id);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to create conversation"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (conversationId) {
      await fetchMessagesForConversation(conversationId);
    }
  };

  const fetchMessagesForConversation = async (convId: string) => {
    try {
      setLoading(true);
      const response = await messageService.getConversationMessages(convId, { limit: 50 });
      const messagesData = response?.data?.messages || response?.data || [];
      setMessages(Array.isArray(messagesData) ? messagesData : []);
      setTimeout(() => scrollToBottom('auto'), 100);
      await messageService.markMessagesAsRead(convId);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch messages"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !conversationId) return;

    if (containsInappropriateContent(newMessage)) {
      toast({
        variant: "destructive",
        title: "Inappropriate Content Detected",
        description: "Your message contains offensive language. Please remove inappropriate words and try again."
      });
      return;
    }

    try {
      setSending(true);
      const response = await messageService.sendMessage(conversationId, newMessage.trim());
      const newMsg = response?.data;
      if (newMsg) {
        setMessages(prev => [...prev, newMsg]);
        setTimeout(() => scrollToBottom('smooth'), 50);
      }
      setNewMessage("");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to send message"
      });
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await messageService.deleteMessage(messageId);
      setMessages(prev => prev.filter(m => m._id !== messageId));
      toast({
        title: "Success",
        description: "Message deleted successfully"
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to delete message"
      });
    }
  };

  const canDeleteMessage = (messageDate: string): boolean => {
    const messageTime = new Date(messageDate).getTime();
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    return (now - messageTime) <= twentyFourHours;
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] max-w-[80vw] h-[80vh] max-h-[80vh] p-0 flex flex-col backdrop-blur-sm border-border/50 shadow-2xl">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={participant.avatar} />
                <AvatarFallback className="bg-primary/20 text-primary font-medium">
                  {participant.name?.split(' ').map(n => n[0]).join('') || 'U'}
                </AvatarFallback>
              </Avatar>
              <DialogTitle className="text-lg font-semibold">{participant.name || 'Chat'}</DialogTitle>
            </div>
          </div>
        </DialogHeader>

        {/* Messages */}
        <ScrollArea className="flex-1 px-6 py-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground text-sm">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => {
                const isMe = message.sender._id === currentUser?._id;
                const canDelete = isMe && canDeleteMessage(message.createdAt);
                
                return (
                  <div
                    key={message._id}
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`flex items-end gap-1 max-w-[70%] group ${isMe ? "flex-row" : "flex-row-reverse"}`}>
                      <div className="relative">
                        <div className={`rounded-2xl px-4 py-2 ${
                          isMe 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-muted"
                        }`}>
                          <p className="text-sm break-words">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            isMe 
                              ? "text-primary-foreground/70" 
                              : "text-muted-foreground"
                          }`}>
                            {getMessageTime(message.createdAt)}
                          </p>
                        </div>
                      </div>
                      {isMe && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 mb-1"
                            >
                              <MoreVertical className="w-4 h-4 text-muted-foreground" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleDeleteMessage(message._id)}
                              disabled={!canDelete}
                              className="text-destructive focus:text-destructive cursor-pointer"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              {canDelete ? "Delete message" : "Delete (expired)"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                      {!isMe && (
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={message.sender.avatar} />
                          <AvatarFallback className="bg-primary/20 text-primary text-xs">
                            {message.sender.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        {/* Input */}
        <div className="px-6 py-4 border-t">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && !sending && handleSendMessage()}
              disabled={sending || !conversationId}
              className="flex-1"
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || sending || !conversationId}
              size="icon"
            >
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
