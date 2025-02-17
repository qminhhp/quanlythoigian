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
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold">
                {language === "vi" ? "Quản lý thời gian" : "ConquerDay"}
              </Link>
            </div>
            <nav className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link to="/home">{t("nav", "tasks")}</Link>
              <Link to="/habits">{t("nav", "habits")}</Link>
              <Link to="/badges">{t("nav", "badges")}</Link>
              <Link to="/blog">{t("nav", "blog")}</Link>
            </nav>
          </div>
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  {user.user_metadata?.displayName ||
                    user.user_metadata?.username}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Link to="/settings">{t("nav", "settings")}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link to="/profile">{t("nav", "profile")}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
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
