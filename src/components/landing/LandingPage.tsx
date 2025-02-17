import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";

interface Page {
  title: string;
  content: string;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  og_image: string;
  canonical_url: string;
}

export default function LandingPage() {
  const { language } = useLanguage();
  const [page, setPage] = useState<Page | null>(null);

  useEffect(() => {
    const loadPage = async () => {
      const { data } = await supabase
        .from("pages")
        .select("*")
        .eq("slug", "home")
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
  }, [language]);

  if (!page) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: page.content }}
      />
    </div>
  );
}
