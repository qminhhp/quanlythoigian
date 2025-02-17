import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Rocket, Target, Trophy, Zap } from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/auth");
  };

  const content = {
    title: "ConquerDay",
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
        icon: <Target className="w-8 h-8 text-blue-500" />,
        gradient: "from-blue-500/10 to-blue-500/5",
        border: "border-blue-200",
      },
      {
        title: "Habit Building",
        description:
          "Track and maintain daily habits with streaks and milestones.",
        icon: <Zap className="w-8 h-8 text-purple-500" />,
        gradient: "from-purple-500/10 to-purple-500/5",
        border: "border-purple-200",
      },
      {
        title: "Progress Tracking",
        description: "Earn badges and level up as you achieve your goals.",
        icon: <Trophy className="w-8 h-8 text-amber-500" />,
        gradient: "from-amber-500/10 to-amber-500/5",
        border: "border-amber-200",
      },
    ],
    cta: "Ready to take control of your time?",
    startNow: "Start Now - It's Free",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-amber-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-black/[0.02] -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center relative">
            {/* Decorative elements */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-transparent via-blue-500 to-transparent blur-[1px]" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 blur-[32px] opacity-20" />
            </div>

            <div className="inline-flex items-center gap-2 bg-white/50 backdrop-blur-sm px-4 py-1.5 rounded-full border border-gray-200/50 mb-6">
              <Rocket className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Level up your productivity
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-gray-900 via-blue-800 to-purple-900 bg-clip-text text-transparent">
              {content.title}
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              {content.subtitle}
            </p>
            <div className="flex justify-center gap-4">
              <Button
                size="lg"
                className="text-lg px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 transition-all duration-200"
                onClick={handleGetStarted}
              >
                {content.getStarted}
              </Button>
              <Link to="/blog">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 border-2 hover:bg-gray-50/50"
                >
                  {content.readBlog}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-gray-900 via-blue-800 to-purple-900 bg-clip-text text-transparent">
            {content.keyFeatures}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {content.features.map((feature, index) => (
              <div
                key={index}
                className={`p-8 rounded-2xl bg-gradient-to-b ${feature.gradient} border ${feature.border} backdrop-blur-sm hover:scale-105 transition-transform duration-200`}
              >
                <div className="mb-6">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="p-8 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              {content.cta}
            </h2>
            <Button
              size="lg"
              className="text-lg px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 transition-all duration-200"
              onClick={handleGetStarted}
            >
              {content.startNow}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
