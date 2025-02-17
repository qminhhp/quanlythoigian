import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Link, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

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

  const handleGetStarted = () => {
    navigate("/auth");
  };

  const content = {
    en: {
      subtitle:
        "Master your time, build lasting habits, and achieve your goals with our powerful time management platform.",
      getStarted: "Get Started",
      readBlog: "Read Blog",
      keyFeatures: "Key Features",
      features: [
        {
          title: "Task Management",
          description:
            "Organize tasks using the Eisenhower Matrix for better prioritization.",
        },
        {
          title: "Habit Building",
          description:
            "Track and maintain daily habits with streaks and milestones.",
        },
        {
          title: "Progress Tracking",
          description: "Earn badges and level up as you achieve your goals.",
        },
      ],
      cta: "Ready to take control of your time?",
      startNow: "Start Now - It's Free",
    },
    vi: {
      subtitle:
        "Làm chủ thời gian, xây dựng thói quen bền vững và đạt được mục tiêu của bạn với nền tảng quản lý thời gian mạnh mẽ của chúng tôi.",
      getStarted: "Bắt Đầu Ngay",
      readBlog: "Đọc Blog",
      keyFeatures: "Tính Năng Chính",
      features: [
        {
          title: "Quản Lý Công Việc",
          description:
            "Sắp xếp công việc sử dụng Ma trận Eisenhower để ưu tiên tốt hơn.",
        },
        {
          title: "Xây Dựng Thói Quen",
          description:
            "Theo dõi và duy trì thói quen hàng ngày với chuỗi và mốc thành tích.",
        },
        {
          title: "Theo Dõi Tiến Độ",
          description: "Nhận huy hiệu và lên cấp khi đạt được mục tiêu.",
        },
      ],
      cta: "Sẵn sàng làm chủ thời gian của bạn?",
      startNow: "Bắt Đầu Ngay - Miễn Phí",
    },
  };

  const t = content[language] || content.en;

  if (!page) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6">
              {language === "vi" ? "Quản Lý Thời Gian" : "ConquerDay"}
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              {t.subtitle}
            </p>
            <div className="flex justify-center gap-4">
              <Button
                size="lg"
                className="text-lg px-8 bg-[#0f172a] hover:bg-[#1e293b]"
                onClick={handleGetStarted}
              >
                {t.getStarted}
              </Button>
              <Link to="/blog">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  {t.readBlog}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            {t.keyFeatures}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {t.features.map((feature, index) => (
              <div key={index} className="p-6 rounded-lg bg-gray-50">
                <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">{t.cta}</h2>
          <Button
            size="lg"
            className="text-lg px-8 bg-[#0f172a] hover:bg-[#1e293b]"
            onClick={handleGetStarted}
          >
            {t.startNow}
          </Button>
        </div>
      </div>

      {/* Dynamic Content */}
      <div
        className="prose prose-lg max-w-none px-4 sm:px-6 lg:px-8 py-16"
        dangerouslySetInnerHTML={{ __html: page.content }}
      />
    </div>
  );
}
