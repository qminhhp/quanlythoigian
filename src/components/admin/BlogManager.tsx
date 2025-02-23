import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  language: "en" | "vi";
  status: "draft" | "published";
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  og_image: string;
  canonical_url: string;
  category_id?: string;
  scheduled_for?: string;
  blog_categories?: {
    name: string;
  };
}

export function BlogManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [filter, setFilter] = useState<"all" | "draft" | "published">("all");
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState<Partial<BlogPost>>({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    language: "en",
    status: "draft",
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
    og_image: "",
    canonical_url: "",
    category_id: undefined,
    scheduled_for: undefined,
  });

  useEffect(() => {
    loadPosts();
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const { data } = await supabase.from<Category>("blog_categories").get();
    if (data) setCategories(data);
  };

  const loadPosts = async () => {
    const { data } = await supabase
      .from<BlogPost>("blog_posts")
      .select("*, blog_categories(name)")
      .get();
    if (data) setPosts(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const postData = {
      ...formData,
      author_id: user.id,
      published_at:
        formData.status === "published" && !formData.scheduled_for
          ? new Date().toISOString()
          : null,
      scheduled_for: formData.scheduled_for || null,
    };

    const { error } = selectedPost
      ? await supabase
          .from("blog_posts")
          .where("id", selectedPost.id)
          .update(postData)
      : await supabase.from("blog_posts").insert(postData);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save post",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Post saved successfully",
      });
      setSelectedPost(null);
      setFormData({
        title: "",
        slug: "",
        content: "",
        excerpt: "",
        language: "en",
        status: "draft",
        meta_title: "",
        meta_description: "",
        meta_keywords: "",
        og_image: "",
        canonical_url: "",
        category_id: undefined,
        scheduled_for: undefined,
      });
      loadPosts();
    }
  };

  const handleEdit = (post: BlogPost) => {
    setSelectedPost(post);
    setFormData({
      ...post,
      scheduled_for: post.scheduled_for?.slice(0, 16) || undefined,
    });
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("blog_posts")
      .where("id", id)
      .delete();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Post deleted successfully",
      });
      loadPosts();
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random()}.${fileExt}`
      const filePath = `blog-images/${fileName}`
      
      // Upload to storage
      const { data, error } = await supabase.storage
        .from('blog-images')
        .upload(filePath, file)
        
      if (error) throw error
        
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('blog-images')
        .getPublicUrl(filePath)
        
      // Set the URL in form data
      setFormData(prev => ({
        ...prev,
        og_image: publicUrl
      }))
      
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive"
      })
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-lg font-medium mb-4">
          {selectedPost ? "Edit Post" : "New Post"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Slug</label>
              <Input
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select
                value={formData.category_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, category_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Content</label>
            <Textarea
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              rows={10}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Excerpt</label>
            <Textarea
              value={formData.excerpt}
              onChange={(e) =>
                setFormData({ ...formData, excerpt: e.target.value })
              }
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Language</label>
              <Select
                value={formData.language}
                onValueChange={(value: "en" | "vi") =>
                  setFormData({ ...formData, language: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="vi">Vietnamese</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={formData.status}
                onValueChange={(value: "draft" | "published") =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Schedule Publication
              </label>
              <Input
                type="datetime-local"
                value={formData.scheduled_for || ""}
                onChange={(e) =>
                  setFormData({ ...formData, scheduled_for: e.target.value })
                }
              />
              <p className="text-xs text-gray-500">
                Leave empty to publish immediately when status is set to
                published
              </p>
            </div>
          </div>

          <div className="border-t pt-4 mt-4">
            <h3 className="text-lg font-medium mb-4">SEO Settings</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Meta Title</label>
                <Input
                  value={formData.meta_title}
                  onChange={(e) =>
                    setFormData({ ...formData, meta_title: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Meta Description</label>
                <Textarea
                  value={formData.meta_description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      meta_description: e.target.value,
                    })
                  }
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Meta Keywords</label>
                <Input
                  value={formData.meta_keywords}
                  onChange={(e) =>
                    setFormData({ ...formData, meta_keywords: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">OG Image</label>
                <div className="space-y-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleImageUpload(file)
                    }}
                  />
                  <Input
                    value={formData.og_image}
                    onChange={(e) =>
                      setFormData({ ...formData, og_image: e.target.value })
                    }
                    placeholder="Or enter image URL directly"
                  />
                  {formData.og_image && (
                    <img 
                      src={formData.og_image} 
                      alt="Preview" 
                      className="mt-2 max-w-xs rounded"
                    />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Canonical URL</label>
                <Input
                  value={formData.canonical_url}
                  onChange={(e) =>
                    setFormData({ ...formData, canonical_url: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            {selectedPost && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSelectedPost(null);
                  setFormData({
                    title: "",
                    slug: "",
                    content: "",
                    excerpt: "",
                    language: "en",
                    status: "draft",
                    meta_title: "",
                    meta_description: "",
                    meta_keywords: "",
                    og_image: "",
                    canonical_url: "",
                    category_id: undefined,
                    scheduled_for: undefined,
                  });
                }}
              >
                Cancel
              </Button>
            )}
            <Button type="submit">{selectedPost ? "Update" : "Create"}</Button>
          </div>
        </form>
      </Card>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium">Blog Posts</h2>
          <div className="flex gap-4">
            <Input
              placeholder="Search posts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64"
            />
            <Select
              value={filter}
              onValueChange={(value: "all" | "draft" | "published") =>
                setFilter(value)
              }
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="draft">Drafts</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-4">
          {posts
            .filter((post) => {
              if (filter === "all") return true;
              return post.status === filter;
            })
            .filter(
              (post) =>
                post.title.toLowerCase().includes(search.toLowerCase()) ||
                post.content.toLowerCase().includes(search.toLowerCase()),
            )
            .map((post) => (
              <div
                key={post.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{post.title}</h3>
                    {post.status === "published" && (
                      <a
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded hover:bg-green-200 transition-colors"
                      >
                        View Live
                      </a>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {post.language.toUpperCase()} • {post.status}
                    {post.scheduled_for && (
                      <>
                        {" "}
                        • Scheduled for{" "}
                        {new Date(post.scheduled_for).toLocaleString()}
                      </>
                    )}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(post)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(post.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
        </div>
      </Card>
    </div>
  );
}
