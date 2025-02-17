import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

export function Footer() {
  const { user } = useAuth();

  return (
    <footer className="bg-white border-t mt-auto">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">About ConquerDay</h3>
            <p className="text-gray-600">
              Master your time, build lasting habits, and achieve your goals
              with our powerful time management platform.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/blog"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Blog
                </Link>
              </li>
              {!user && (
                <li>
                  <Link
                    to="/auth"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Sign In
                  </Link>
                </li>
              )}
              <li>
                <Link
                  to="/privacy"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Features</h3>
            <ul className="space-y-2">
              <li className="text-gray-600">Task Management</li>
              <li className="text-gray-600">Habit Building</li>
              <li className="text-gray-600">Progress Tracking</li>
              <li className="text-gray-600">Telegram Integration</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Get Started</h3>
            <p className="text-gray-600 mb-4">
              Join thousands of users who are already conquering their day.
            </p>
            {!user && (
              <Link to="/auth">
                <Button className="w-full">Sign Up Now</Button>
              </Link>
            )}
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-gray-500">
          <p>© {new Date().getFullYear()} ConquerDay. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
