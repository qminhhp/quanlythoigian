import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useNavigate, useLocation } from "react-router-dom";
import { LogOut, CheckSquare, Award, Dumbbell, Settings } from "lucide-react";

export function Header() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="border-b">
      <div className="flex h-16 items-center px-4 max-w-4xl mx-auto">
        <nav className="flex items-center space-x-4 lg:space-x-6 mx-6">
          <Button
            variant={isActive("/home") ? "default" : "ghost"}
            className="text-sm font-medium transition-colors hover:text-primary flex items-center gap-2"
            onClick={() => navigate("/home")}
          >
            <CheckSquare className="h-4 w-4" />
            Home
          </Button>
          <Button
            variant={isActive("/habits") ? "default" : "ghost"}
            className="text-sm font-medium transition-colors hover:text-primary flex items-center gap-2"
            onClick={() => navigate("/habits")}
          >
            <Dumbbell className="h-4 w-4" />
            Habits
          </Button>
          <Button
            variant={isActive("/badges") ? "default" : "ghost"}
            className="text-sm font-medium transition-colors hover:text-primary flex items-center gap-2"
            onClick={() => navigate("/badges")}
          >
            <Award className="h-4 w-4" />
            Badges
          </Button>
          <Button
            variant={isActive("/settings") ? "default" : "ghost"}
            className="text-sm font-medium transition-colors hover:text-primary flex items-center gap-2"
            onClick={() => navigate("/settings")}
          >
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </nav>
        <div className="ml-auto flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
            title="Sign out"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
