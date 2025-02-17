import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function Header() {
  const { user, signOut } = useAuth();
  const { t, language } = useLanguage();

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
            <div className="flex-shrink-0">
              <Link to="/" className="text-xl font-bold whitespace-nowrap">
                {language === "vi" ? "Quản lý thời gian" : "ConquerDay"}
              </Link>
            </div>
            <nav className="hidden md:flex md:ml-8 space-x-1 md:space-x-2 lg:space-x-4">
              {[
                { to: "/home", label: t("nav", "tasks") },
                { to: "/habits", label: t("nav", "habits") },
                { to: "/badges", label: t("nav", "badges") },
                { to: "/blog", label: t("nav", "blog") },
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
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="min-w-[100px] justify-start"
                >
                  {user.user_metadata?.displayName ||
                    user.user_metadata?.username}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="w-full">
                  <Link to="/settings" className="w-full">
                    {t("nav", "settings")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="w-full">
                  <Link to="/profile" className="w-full">
                    {t("nav", "profile")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut} className="w-full">
                  {t("nav", "signOut")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
