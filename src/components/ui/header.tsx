import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/ui/mobile-nav";
import { useAuth } from "@/lib/auth";

export function Header() {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (!user) return null;

  return (
    <header className="bg-white border-b">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <MobileNav isAdmin={false} />
            <div className="flex-shrink-0 ml-2 md:ml-0">
              <Link to="/" className="text-xl font-bold whitespace-nowrap">
                ConquerDay
              </Link>
            </div>
            <nav className="hidden md:flex md:ml-8 space-x-1 md:space-x-2 lg:space-x-4">
              {[
                { to: "/home", label: "Tasks" },
                { to: "/habits", label: "Habits" },
                { to: "/badges", label: "Badges" },
                { to: "/blog", label: "Blog" },
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="hidden md:flex md:items-center md:space-x-4">
            <Link
              to="/settings"
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            >
              Settings
            </Link>
            <Link
              to="/profile"
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            >
              Profile
            </Link>
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
