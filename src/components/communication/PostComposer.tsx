import { useState, useRef } from "react";
import { Send, ImageIcon, BarChart3, Link2, Bold, Italic, Code, X } from "lucide-react";
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
import { communicationService } from "@/services/ApiServices";
import { containsInappropriateContent } from "@/lib/contentFilter";

const categories = [
  "General",
  "Mentorship",
  "Events",
  "Research",
  "Jobs",
  "Alumni Stories"
];

interface PostComposerProps {
  onPostCreated?: () => void;
}

export function PostComposer({ onPostCreated }: PostComposerProps) {
  const [content, setContent] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (images.length + files.length > 5) {
      toast({
        title: "Too many images",
        description: "You can upload a maximum of 5 images per post.",
        variant: "destructive",
      });
      return;
    }

    const newImages = [...images, ...files];
    setImages(newImages);

    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!content.trim() || !selectedCategory) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Check for inappropriate content
    if (containsInappropriateContent(content)) {
      toast({
        title: "Inappropriate Content Detected",
        description: "Your post contains offensive language. Please remove inappropriate words and try again.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append('content', content);
      formData.append('category', selectedCategory);

      // Append images
      images.forEach((image) => {
        formData.append('images', image);
      });

      const response = await communicationService.createPost(formData);

      if (response.success) {
        toast({
          title: "Post published!",
          description: "Your post has been shared with the community.",
        });

        // Reset form
        setContent("");
        setSelectedCategory("");
        setImages([]);
        setImagePreviews([]);

        // Notify parent
        if (onPostCreated) {
          onPostCreated();
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-card border border-border">
      <CardContent className="p-3 sm:p-4">
        <div className="flex gap-3 sm:gap-4">
          <div className="relative flex-shrink-0">
            <Avatar className="w-8 h-8 sm:w-10 sm:h-10">
              <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs sm:text-base">
                AD
              </AvatarFallback>
            </Avatar>
            <div className="absolute bottom-0 right-0 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-green-500 border-2 border-background rounded-full"></div>
          </div>

          <div className="flex-1 space-y-3 sm:space-y-4">
            {/* Category Selection */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="text-xs sm:text-sm font-medium text-muted-foreground">Post to:</span>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[140px] sm:w-40 h-8 text-xs sm:text-sm">
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
                className="min-h-[100px] sm:min-h-[120px] resize-none border-border focus:border-primary text-sm sm:text-base"
                disabled={isSubmitting}
              />

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-16 sm:h-20 object-cover rounded-md border"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shadow-sm"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Formatting Tools */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
                <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                  <Button variant="ghost" size="sm" className="p-1.5 sm:p-2 h-auto" disabled>
                    <Bold className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-1.5 sm:p-2 h-auto" disabled>
                    <Italic className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-1.5 sm:p-2 h-auto" disabled>
                    <Code className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </Button>
                  <div className="w-px h-3 sm:h-4 bg-border mx-0.5 sm:mx-1" />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageSelect}
                    className="hidden"
                    disabled={isSubmitting || images.length >= 5}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1.5 sm:p-2 h-auto"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isSubmitting || images.length >= 5}
                  >
                    <ImageIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-1.5 sm:p-2 h-auto" disabled>
                    <Link2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-1.5 sm:p-2 h-auto" disabled>
                    <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </Button>
                </div>

                <div className="flex items-center justify-end gap-3 w-full sm:w-auto">
                  <span className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap">
                    {content.length}/5000
                  </span>
                  <Button
                    onClick={handleSubmit}
                    disabled={!content.trim() || !selectedCategory || isSubmitting}
                    size="sm"
                    className="gap-2 px-6 h-9 text-sm rounded-full bg-green-500/10 text-green-600 hover:bg-green-500/25 hover:text-green-700 border border-green-500/20 hover:border-green-500/40 font-semibold focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-green-500/15 dark:text-green-400 dark:hover:bg-green-500/30 dark:hover:text-green-300"
                  >
                    <Send className="w-4 h-4" />
                    {isSubmitting ? "Posting..." : "Post"}
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