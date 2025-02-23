import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { CommentSection } from "./CommentSection";

interface RelatedPost {
  slug: string;
  title: string;
}

interface BlogPost {
  id: string;
  title: string;
  content: string;
  published_at: string;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  og_image: string;
  canonical_url: string;
  category_id: string;
}

export function BlogPost() {
  const { slug } = useParams();
  const language = "en";
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([]);

  useEffect(() => {
    const loadPost = async () => {
      // Load main post
      const { data } = await supabase
        .from<BlogPost>("blog_posts")
        .where("slug", slug)
        .where("language", language)
        .where("status", "published")
        .first();

      if (data) {
        setPost(data);

        // Load related posts
        const query = supabase
          .from<RelatedPost>("blog_posts")
          .select("slug, title")
          .where("language", language)
          .where("status", "published")
          .where("category_id", data.category_id);

        // Add NOT EQUAL condition for id
        const { data: relatedData } = await query
          .where("id", "!=", data.id)
          .limit(3)
          .get();

        if (relatedData) {
          setRelatedPosts(relatedData);
        }

        // Update meta tags
        document.title = data.meta_title || data.title;
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute("content", data.meta_description);
        const metaKeywords = document.querySelector('meta[name="keywords"]');
        if (metaKeywords)
          metaKeywords.setAttribute("content", data.meta_keywords);
        const ogImage = document.querySelector('meta[property="og:image"]');
        if (ogImage) ogImage.setAttribute("content", data.og_image);
        const canonical = document.querySelector('link[rel="canonical"]');
        if (canonical) canonical.setAttribute("href", data.canonical_url);
      }
    };

    loadPost();
  }, [slug, language]);

  if (!post) return null;

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <Card className="p-8">
        <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
        <p className="text-gray-500 mb-8">
          {new Date(post.published_at).toLocaleDateString()}
        </p>
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Related Posts</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.slug}
                  to={`/blog/${relatedPost.slug}`}
                  className="p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <h3 className="font-medium">{relatedPost.title}</h3>
                </Link>
              ))}
            </div>
          </div>
        )}

        <CommentSection postId={post.id} />
      </Card>
    </div>
  );
}
