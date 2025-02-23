import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface BlogPost {
  slug: string;
  title: string;
  status: string;
  published_at: string;
}

export function BlogLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    loadSidebarData();
  }, []);

  const loadSidebarData = async () => {
    // Load categories
    const { data: categoriesData } = await supabase
      .from<Category>("blog_categories")
      .get();
    if (categoriesData) setCategories(categoriesData);

    // Load recent posts
    const { data: postsData } = await supabase
      .from<BlogPost>("blog_posts")
      .select("slug, title")
      .where("status", "published")
      .orderBy("published_at", false)
      .limit(5)
      .get();
    if (postsData) setRecentPosts(postsData);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="text-xl font-bold">
              ConquerDay
            </Link>
            {user ? (
              <Link to="/home">
                <Button>Dashboard</Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button>Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">{children}</div>

          <div className="space-y-6">
            {/* Categories Widget */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    to={`/blog/category/${category.slug}`}
                    className="block text-gray-600 hover:text-gray-900"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </Card>

            {/* Recent Posts Widget */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Posts</h3>
              <div className="space-y-2">
                {recentPosts.map((post) => (
                  <Link
                    key={post.slug}
                    to={`/blog/${post.slug}`}
                    className="block text-gray-600 hover:text-gray-900"
                  >
                    {post.title}
                  </Link>
                ))}
              </div>
            </Card>

            {/* Social Media Widget */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
              <div className="flex gap-4">
                <a
                  href="https://twitter.com/conquerdayapp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Twitter
                </a>
                <a
                  href="https://facebook.com/conquerdayapp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Facebook
                </a>
              </div>
            </Card>

            {/* Newsletter Widget */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Newsletter</h3>
              <p className="text-gray-600 mb-4">
                Get productivity tips delivered to your inbox
              </p>
              <Link to="/auth">
                <Button className="w-full">Subscribe Now</Button>
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
