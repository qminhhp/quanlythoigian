import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  published_at: string;
}

export function BlogList() {
  const { language } = useLanguage();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const { category } = useParams();

  useEffect(() => {
    const loadPosts = async () => {
      let query = supabase
        .from("blog_posts")
        .select(
          "id, title, slug, excerpt, published_at, blog_categories!inner(slug)",
        )
        .eq("language", language)
        .eq("status", "published");

      if (category) {
        query = query.eq("blog_categories.slug", category);
      }

      const { data } = await query.order("published_at", { ascending: false });

      if (data) setPosts(data);
    };

    loadPosts();
  }, [language]);

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-8">Blog</h1>
      <div className="space-y-6">
        {posts.map((post) => (
          <Card key={post.id} className="p-6">
            <h2 className="text-xl font-semibold mb-2">
              <Link
                to={`/blog/${post.slug}`}
                className="hover:text-blue-600 transition-colors"
              >
                {post.title}
              </Link>
            </h2>
            <p className="text-gray-600 mb-4">{post.excerpt}</p>
            <p className="text-sm text-gray-500">
              {new Date(post.published_at).toLocaleDateString()}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
