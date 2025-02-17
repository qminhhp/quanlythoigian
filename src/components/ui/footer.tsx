import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { supabase } from "@/lib/supabase";

interface Page {
  title: string;
  slug: string;
  language: string;
}

export function Footer() {
  const language = "en";
  const [pages, setPages] = useState<Page[]>([]);

  useEffect(() => {
    const loadPages = async () => {
      const { data } = await supabase
        .from("pages")
        .select("title, slug, language")
        .eq("language", language)
        .eq("published", true);
      if (data) setPages(data);
    };

    loadPages();
  }, [language]);

  return (
    <footer className="bg-white border-t mt-auto">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              {language === "vi" ? "Quản Lý Thời Gian" : "ConquerDay"}
            </h3>
            <p className="text-sm text-gray-600">
              {language === "vi"
                ? "Quản lý thời gian hiệu quả"
                : "Effective time management"}
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              {language === "vi" ? "Liên Kết" : "Links"}
            </h3>
            <div className="space-y-2">
              <Link
                to="/blog"
                className="block text-sm text-gray-600 hover:text-gray-900"
              >
                Blog
              </Link>
              {pages.map((page) => (
                <Link
                  key={page.slug}
                  to={`/${page.slug}`}
                  className="block text-sm text-gray-600 hover:text-gray-900"
                >
                  {page.title}
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              {language === "vi" ? "Theo Dõi" : "Follow Us"}
            </h3>
            <div className="space-y-2">
              <a
                href="https://twitter.com/conquerdayapp"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-gray-600 hover:text-gray-900"
              >
                Twitter
              </a>
              <a
                href="https://facebook.com/conquerdayapp"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-gray-600 hover:text-gray-900"
              >
                Facebook
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              {language === "vi" ? "Liên Hệ" : "Contact"}
            </h3>
            <div className="space-y-2">
              <a
                href="mailto:support@conquerday.com"
                className="block text-sm text-gray-600 hover:text-gray-900"
              >
                support@conquerday.com
              </a>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-gray-600">
          © {new Date().getFullYear()}{" "}
          {language === "vi" ? "Quản Lý Thời Gian" : "ConquerDay"}.{" "}
          {language === "vi" ? "Đã đăng ký bản quyền." : "All rights reserved."}
        </div>
      </div>
    </footer>
  );
}
