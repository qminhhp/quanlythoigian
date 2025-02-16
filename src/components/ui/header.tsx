import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export function Header() {
  const { user, signOut } = useAuth();

  return (
    <header className="bg-white border-b">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-12">
            <Link to="/home" className="text-lg font-semibold">
              ConquerDay
            </Link>
            <nav className="flex items-center gap-8">
              <Link
                to="/home"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Tasks
              </Link>
              <Link
                to="/habits"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Habits
              </Link>
              <Link
                to="/badges"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Badges
              </Link>
              <Link
                to="/blog"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Blog
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-8">
            <Link
              to="/settings"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Settings
            </Link>
            <Link
              to="/profile"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Profile
            </Link>
            <Button
              variant="outline"
              onClick={() => signOut()}
              className="text-sm"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
