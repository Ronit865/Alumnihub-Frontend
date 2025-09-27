import { useState } from "react";
import { ArrowUp, ArrowDown, MessageCircle, Share, Bookmark, MoreHorizontal } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface RedditPostProps {
  id: number;
  user: string;
  message: string;
  timestamp: string;
  replies: number;
  category: string;
  upvotes?: number;
  downvotes?: number;
  userVote?: 'up' | 'down' | null;
}

export function RedditPostCard({ 
  id, 
  user, 
  message, 
  timestamp, 
  replies, 
  category,
  upvotes = 0,
  downvotes = 0,
  userVote = null
}: RedditPostProps) {
  const [currentVote, setCurrentVote] = useState<'up' | 'down' | null>(userVote);
  const [voteCount, setVoteCount] = useState(upvotes - downvotes);

  const handleVote = (voteType: 'up' | 'down') => {
    let newVoteCount = voteCount;
    let newVote: 'up' | 'down' | null = voteType;

    // Remove previous vote
    if (currentVote === 'up') newVoteCount--;
    if (currentVote === 'down') newVoteCount++;
    
    // Apply new vote or remove if same
    if (currentVote === voteType) {
      newVote = null;
    } else {
      if (voteType === 'up') newVoteCount++;
      if (voteType === 'down') newVoteCount--;
    }

    setCurrentVote(newVote);
    setVoteCount(newVoteCount);
  };

  return (
    <Card className="bg-card border border-border hover:border-accent-foreground/20 transition-all duration-200">
      <div className="flex gap-0">
        {/* Vote Section */}
        <div className="flex flex-col items-center p-2 bg-muted/30 border-r border-border">
          <Button
            variant="ghost"
            size="sm"
            className={`p-1 h-auto hover:bg-accent ${
              currentVote === 'up' 
                ? 'text-orange-500 hover:text-orange-600' 
                : 'text-muted-foreground hover:text-orange-500'
            }`}
            onClick={() => handleVote('up')}
          >
            <ArrowUp className="w-5 h-5" />
          </Button>
          
          <span className={`text-sm font-medium py-1 ${
            voteCount > 0 
              ? 'text-orange-500' 
              : voteCount < 0 
                ? 'text-blue-500' 
                : 'text-muted-foreground'
          }`}>
            {voteCount > 0 ? '+' : ''}{voteCount}
          </span>
          
          <Button
            variant="ghost"
            size="sm"
            className={`p-1 h-auto hover:bg-accent ${
              currentVote === 'down' 
                ? 'text-blue-500 hover:text-blue-600' 
                : 'text-muted-foreground hover:text-blue-500'
            }`}
            onClick={() => handleVote('down')}
          >
            <ArrowDown className="w-5 h-5" />
          </Button>
        </div>

        {/* Content Section */}
        <div className="flex-1 p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                  {user.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">u/{user}</span>
                <span className="text-xs text-muted-foreground">•</span>
                <Badge variant="outline" className="text-xs px-2 py-0">
                  {category}
                </Badge>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">{timestamp}</span>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="p-1 h-auto">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Bookmark className="mr-2 h-4 w-4" />
                  Save
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Share className="mr-2 h-4 w-4" />
                  Share
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Message Content */}
          <div className="mb-4">
            <p className="text-sm leading-relaxed text-foreground">{message}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2 text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="text-xs">{replies} comments</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2 text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              <Share className="w-4 h-4" />
              <span className="text-xs">Share</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2 text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              <Bookmark className="w-4 h-4" />
              <span className="text-xs">Save</span>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}