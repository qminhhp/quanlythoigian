import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Link } from "react-router-dom";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: {
    display_name: string;
  };
}

interface CommentSectionProps {
  postId: string;
}

export function CommentSection({ postId }: CommentSectionProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    loadComments();

    // Subscribe to changes
    const subscription = supabase
      .channel(`comments-${postId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "blog_comments",
          filter: `post_id=eq.${postId}`,
        },
        loadComments,
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [postId]);

  const loadComments = async () => {
    const { data } = await supabase
      .from("blog_comments")
      .select("*, profiles(display_name)")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (data) setComments(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    const { error } = await supabase.from("blog_comments").insert({
      post_id: postId,
      user_id: user.id,
      content: newComment.trim(),
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to post comment",
        variant: "destructive",
      });
    } else {
      setNewComment("");
      loadComments();
    }
  };

  const handleEdit = async (commentId: string) => {
    if (!editContent.trim()) return;

    const { error } = await supabase
      .from("blog_comments")
      .update({ content: editContent.trim() })
      .eq("id", commentId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update comment",
        variant: "destructive",
      });
    } else {
      setEditingComment(null);
      setEditContent("");
      loadComments();
    }
  };

  const handleDelete = async (commentId: string) => {
    const { error } = await supabase
      .from("blog_comments")
      .delete()
      .eq("id", commentId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive",
      });
    } else {
      loadComments();
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Comments</h2>

      {user ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="mb-2"
            required
          />
          <Button type="submit">Post Comment</Button>
        </form>
      ) : (
        <Card className="p-4 mb-6 bg-gray-50 text-center">
          <p className="text-gray-600 mb-2">
            Please sign in to leave a comment
          </p>
          <Link to="/auth">
            <Button>Sign In</Button>
          </Link>
        </Card>
      )}

      <div className="space-y-4">
        {comments.map((comment) => (
          <Card key={comment.id} className="p-4">
            {editingComment === comment.id ? (
              <div className="space-y-2">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="mb-2"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleEdit(comment.id)}>
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingComment(null);
                      setEditContent("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium">
                      {comment.profiles?.display_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(comment.created_at).toLocaleString()}
                    </p>
                  </div>
                  {user?.id === comment.user_id && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingComment(comment.id);
                          setEditContent(comment.content);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(comment.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  )}
                </div>
                <p className="text-gray-700">{comment.content}</p>
              </>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
