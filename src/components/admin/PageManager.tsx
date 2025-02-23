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

interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  language: "en" | "vi";
  published: boolean;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  og_image: string;
  canonical_url: string;
}

export function PageManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [pages, setPages] = useState<Page[]>([]);
  const [filter, setFilter] = useState<"all" | "en" | "vi">("all");
  const [search, setSearch] = useState("");
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const [formData, setFormData] = useState<Partial<Page>>({
    title: "",
    slug: "",
    content: "",
    language: "en",
    published: false,
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
    og_image: "",
    canonical_url: "",
  });

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    const { data } = await supabase.from("pages").get();
    if (data) setPages(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const pageData = {
      ...formData,
      published: Boolean(formData.published),
    };

    const { error } = selectedPage
      ? await supabase
          .from("pages")
          .where("id", selectedPage.id)
          .update(pageData)
      : await supabase.from("pages").insert(pageData);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save page",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Page saved successfully",
      });
      setSelectedPage(null);
      setFormData({
        title: "",
        slug: "",
        content: "",
        language: "en",
        published: false,
        meta_title: "",
        meta_description: "",
        meta_keywords: "",
        og_image: "",
        canonical_url: "",
      });
      loadPages();
    }
  };

  const handleEdit = (page: Page) => {
    setSelectedPage(page);
    setFormData({
      title: page.title,
      slug: page.slug,
      content: page.content,
      language: page.language,
      published: page.published,
      meta_title: page.meta_title || "",
      meta_description: page.meta_description || "",
      meta_keywords: page.meta_keywords || "",
      og_image: page.og_image || "",
      canonical_url: page.canonical_url || "",
    });
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("pages").where("id", id).delete();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete page",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Page deleted successfully",
      });
      loadPages();
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-lg font-medium mb-4">
          {selectedPage ? "Edit Page" : "New Page"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.published}
                onChange={(e) =>
                  setFormData({ ...formData, published: e.target.checked })
                }
                className="h-4 w-4 rounded border-gray-300"
              />
              <label className="text-sm font-medium">Published</label>
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
                <label className="text-sm font-medium">OG Image URL</label>
                <Input
                  value={formData.og_image}
                  onChange={(e) =>
                    setFormData({ ...formData, og_image: e.target.value })
                  }
                />
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
            {selectedPage && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSelectedPage(null);
                  setFormData({
                    title: "",
                    slug: "",
                    content: "",
                    language: "en",
                    published: false,
                    meta_title: "",
                    meta_description: "",
                    meta_keywords: "",
                    og_image: "",
                    canonical_url: "",
                  });
                }}
              >
                Cancel
              </Button>
            )}
            <Button type="submit">{selectedPage ? "Update" : "Create"}</Button>
          </div>
        </form>
      </Card>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium">Pages</h2>
          <div className="flex gap-4">
            <Input
              placeholder="Search pages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64"
            />
            <Select
              value={filter}
              onValueChange={(value: "all" | "en" | "vi") => setFilter(value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="vi">Vietnamese</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-4">
          {pages
            .filter((page) => {
              if (filter !== "all") return page.language === filter;
              return true;
            })
            .filter(
              (page) =>
                page.title.toLowerCase().includes(search.toLowerCase()) ||
                page.content.toLowerCase().includes(search.toLowerCase()),
            )
            .map((page) => (
              <div
                key={page.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{page.title}</h3>
                    {page.published && (
                      <a
                        href={`/${page.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded hover:bg-green-200 transition-colors"
                      >
                        View Live
                      </a>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {page.language.toUpperCase()} •{" "}
                    {page.published ? "Published" : "Draft"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(page)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(page.id)}
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
