import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, Share, Bookmark, MoreHorizontal, Trash2, Edit, Flag, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VoteButtons } from "./VoteButtons";
import { communicationService } from "@/services/ApiServices";
import { useToast } from "@/hooks/use-toast";

interface RedditPostProps {
  post: any;
  onUpdate?: () => void;
}

export function RedditPostCard({ post, onUpdate }: RedditPostProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSaved, setIsSaved] = useState(post.savedBy?.includes(localStorage.getItem('userId')) || false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editContent, setEditContent] = useState(post.content || "");
  const [isEditing, setIsEditing] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [isReporting, setIsReporting] = useState(false);

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on interactive elements
    const target = e.target as HTMLElement;
    if (
      target.closest('button') ||
      target.closest('a') ||
      target.closest('[role="menuitem"]')
    ) {
      return;
    }
    navigate(`/communications/post/${post._id}`);
  };

  const handleSave = async () => {
    // Immediately update UI for instant feedback
    const newSavedState = !isSaved;
    setIsSaved(newSavedState);

    toast({ title: newSavedState ? "Post saved" : "Post unsaved", variant: "success" });

    // Call API in background
    try {
      await communicationService.toggleSavePost(post._id);
    } catch (error: any) {
      // Revert on error
      setIsSaved(!newSavedState);
      toast({ title: "Error", description: error.message || "Failed to save post. Please try again.", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    // Immediately update UI for instant feedback
    if (onUpdate) {
      onUpdate();
    }

    toast({ title: "Post deleted successfully", variant: "success" });

    // Call API in background
    try {
      await communicationService.deletePost(post._id);
    } catch (error: any) {
      // Delete post error - refresh to restore
      if (onUpdate) {
        onUpdate(); // Refresh to restore if failed
      }
    }
  };

  const handleReport = () => {
    setReportReason("");
    setReportDescription("");
    setReportDialogOpen(true);
  };

  const submitReport = async () => {
    if (!reportReason) {
      toast({ title: "Error", description: "Please select a reason for reporting", variant: "destructive" });
      return;
    }

    setIsReporting(true);
    try {
      await communicationService.reportPost(post._id, {
        reason: reportReason,
        description: reportDescription
      });
      toast({ title: "Post reported", description: "We'll review this post", variant: "success" });
      setReportDialogOpen(false);
    } catch (error: any) {
      if (error.response?.data?.message?.includes("already reported")) {
        toast({ title: "Error", description: "You have already reported this post", variant: "destructive" });
      } else {
        toast({ title: "Error", description: error.message || "Failed to submit report", variant: "destructive" });
      }
    } finally {
      setIsReporting(false);
    }
  };

  const handleShare = async () => {
    const postUrl = `${window.location.origin}/communications/post/${post._id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Post by ${post.author?.name || 'Anonymous'}`,
          text: post.content.substring(0, 100),
          url: postUrl,
        });
      } catch (error) {
        // User cancelled or share failed, fallback to clipboard
        await navigator.clipboard.writeText(postUrl);
        toast({ title: "Link copied to clipboard", variant: "success" });
      }
    } else {
      await navigator.clipboard.writeText(postUrl);
      toast({ title: "Link copied to clipboard", variant: "success" });
    }
  };

  const handleEdit = async () => {
    if (!editContent.trim()) {
      toast({ title: "Error", description: "Post content cannot be empty", variant: "destructive" });
      return;
    }

    setIsEditing(true);
    try {
      await communicationService.updatePost(post._id, { content: editContent });
      toast({ title: "Post updated successfully", variant: "success" });
      setEditDialogOpen(false);
      if (onUpdate) onUpdate();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to update post", variant: "destructive" });
    } finally {
      setIsEditing(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;

    return date.toLocaleDateString();
  };

  const getUserInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };

  const canDeletePost = (): boolean => {
    // Users can delete their posts anytime now
    return true;
  };

  const isAuthor = post.author?._id === localStorage.getItem('userId');
  const canDelete = isAuthor && canDeletePost();


  return (
    <Card
      className="bg-card border border-border hover:border-accent-foreground/20 transition-all duration-200 cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="flex gap-0">
        {/* Vote Section */}
        <VoteButtons
          postId={post._id}
          initialUpvotes={post.upvotes}
          initialDownvotes={post.downvotes}
          upvotedBy={post.upvotedBy || []}
          downvotedBy={post.downvotedBy || []}
          onUpdate={onUpdate}
        />

        {/* Content Section */}
        <div className="flex-1 p-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={post.author?.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                    {getUserInitials(post.author?.name || 'User')}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-background rounded-full"></div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">
                  {post.author?.name || 'Anonymous'}
                </span>
                {post.author?.graduationYear && (
                  <>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">'{post.author.graduationYear.toString().slice(-2)}</span>
                  </>
                )}
                <span className="text-xs text-muted-foreground">•</span>
                <Badge variant="outline" className="text-xs px-2 py-0">
                  {post.category}
                </Badge>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">{formatTimestamp(post.createdAt)}</span>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="p-1 h-auto">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isAuthor ? (
                  <>
                    <DropdownMenuItem onClick={() => { setEditContent(post.content); setEditDialogOpen(true); }}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleDelete}
                      disabled={!canDelete}
                      className="text-destructive focus:text-destructive cursor-pointer"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {canDelete ? 'Delete' : 'Delete (expired)'}
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem onClick={handleReport}>
                      <Flag className="mr-2 h-4 w-4" />
                      Report
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleShare}>
                      <Share className="mr-2 h-4 w-4" />
                      Share
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Message Content */}
          <div className="mb-3">
            <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">{post.content}</p>

            {/* Images */}
            {post.images && post.images.length > 0 && (
              <div className={`mt-2 grid gap-2 ${post.images.length === 1 ? 'grid-cols-1' :
                post.images.length === 2 ? 'grid-cols-2' :
                  'grid-cols-3'
                }`}>
                {post.images.map((image: string, index: number) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Post image ${index + 1}`}
                    className="w-full h-auto rounded-md border object-cover max-h-96"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/communications/post/${post._id}`);
              }}
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="text-xs">{post.commentsCount || 0} comments</span>
            </Button>

            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleShare();
              }}
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
              className={`gap-2 hover:bg-accent ${isSaved ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              onClick={handleSave}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              <span className="text-xs">{isSaved ? 'Saved' : 'Save'}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Post</DialogTitle>
            <DialogDescription>Make changes to your post below.</DialogDescription>
          </DialogHeader>
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            placeholder="What's on your mind?"
            className="min-h-[120px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEdit} disabled={isEditing}>
              {isEditing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report Dialog */}
      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Post</DialogTitle>
            <DialogDescription>Help us understand why you're reporting this post.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Reason <span className="text-destructive">*</span></Label>
              <Select value={reportReason} onValueChange={setReportReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spam">Spam</SelectItem>
                  <SelectItem value="harassment">Harassment</SelectItem>
                  <SelectItem value="inappropriate">Inappropriate Content</SelectItem>
                  <SelectItem value="misinformation">Misinformation</SelectItem>
                  <SelectItem value="abuse">Abuse</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Additional Details (Optional)</Label>
              <Textarea
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="Provide more context about why you're reporting this post..."
                className="min-h-[80px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReportDialogOpen(false)}>Cancel</Button>
            <Button onClick={submitReport} disabled={isReporting || !reportReason} variant="destructive">
              {isReporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}