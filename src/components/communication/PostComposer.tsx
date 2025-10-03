import { useState } from "react";
import { Send, ImageIcon, BarChart3, Link2, Bold, Italic, Code } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const categories = [
  "General",
  "Mentorship",
  "Events", 
  "Research",
  "Jobs",
  "Networking",
  "Alumni Stories"
];

export function PostComposer() {
  const [content, setContent] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const { toast } = useToast();

  const handleSubmit = () => {
    if (content.trim() && selectedCategory) {
      // Handle post submission
      toast({
        title: "Post published!",
        description: "Your post has been shared with the community.",
        variant: "success",
      });
      setContent("");
      setSelectedCategory("");
    }
  };

  return (
    <Card className="bg-card border border-border">
      <CardContent className="p-4">
        <div className="flex gap-4">
          <Avatar className="w-10 h-10 flex-shrink-0">
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              AD
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-4">
            {/* Category Selection */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground">Post to:</span>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40 h-8">
                  <SelectValue placeholder="Choose category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Content Input */}
            <div className="space-y-3">
              <Textarea
                placeholder="What's on your mind? Share something with the alumni community..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[120px] resize-none border-border focus:border-primary"
              />
              
              {/* Formatting Tools */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="p-2 h-auto">
                    <Bold className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-2 h-auto">
                    <Italic className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-2 h-auto">
                    <Code className="w-4 h-4" />
                  </Button>
                  <div className="w-px h-4 bg-border mx-1" />
                  <Button variant="ghost" size="sm" className="p-2 h-auto">
                    <ImageIcon className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-2 h-auto">
                    <Link2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-2 h-auto">
                    <BarChart3 className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    {content.length}/500
                  </span>
                  <Button 
                    onClick={handleSubmit}
                    disabled={!content.trim() || !selectedCategory}
                    size="sm"
                    className="gap-2 px-6"
                  >
                    <Send className="w-4 h-4" />
                    Post
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}