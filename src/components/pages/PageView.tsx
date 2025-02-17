import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Header } from "@/components/ui/header";

interface Page {
  title: string;
  content: string;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  og_image: string;
  canonical_url: string;
}

export default function PageView() {
  const { slug = "home" } = useParams();
  const language = "en";
  const [page, setPage] = useState<Page | null>(null);

  useEffect(() => {
    const loadPage = async () => {
      const { data } = await supabase
        .from("pages")
        .select("*")
        .eq("slug", slug)
        .eq("language", language)
        .eq("published", true)
        .single();

      if (data) {
        setPage(data);

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

    loadPage();
  }, [slug, language]);

  if (!page) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div
        className={`max-w-[1400px] mx-auto ${slug !== "home" ? "px-4 sm:px-6 lg:px-8 py-12" : ""}`}
      >
        {slug === "home" ? (
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        ) : (
          <Card className="p-8">
            <h1 className="text-3xl font-bold mb-8">{page.title}</h1>
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: page.content }}
            />
          </Card>
        )}
      </div>
    </div>
  );
}
