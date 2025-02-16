import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Link } from "react-router-dom";

export default function LandingPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6">
              ConquerDay
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Master your time, build lasting habits, and achieve your goals
              with our powerful time management platform.
            </p>
            <div className="flex justify-center gap-4">
              <Link to="/auth">
                <Button size="lg" className="text-lg px-8">
                  Get Started
                </Button>
              </Link>
              <Link to="/blog">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  Read Blog
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Key Features</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg bg-gray-50">
              <h3 className="text-xl font-semibold mb-4">Task Management</h3>
              <p className="text-gray-600">
                Organize tasks using the Eisenhower Matrix for better
                prioritization.
              </p>
            </div>
            <div className="p-6 rounded-lg bg-gray-50">
              <h3 className="text-xl font-semibold mb-4">Habit Building</h3>
              <p className="text-gray-600">
                Track and maintain daily habits with streaks and milestones.
              </p>
            </div>
            <div className="p-6 rounded-lg bg-gray-50">
              <h3 className="text-xl font-semibold mb-4">Progress Tracking</h3>
              <p className="text-gray-600">
                Earn badges and level up as you achieve your goals.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Ready to take control of your time?
          </h2>
          <Link to="/auth">
            <Button size="lg" className="text-lg px-8">
              Start Now - It's Free
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
