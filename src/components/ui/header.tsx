import { useAuth } from "@/lib/auth";
import { Button } from "./button";
import { useNavigate } from "react-router-dom";
import { UserCircle } from "lucide-react";

export function Header() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const displayName = user?.user_metadata?.displayName || "User";

  return (
    <header className="border-b bg-background">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <button
          onClick={() => navigate("/")}
          className="text-xl font-semibold hover:text-primary transition-colors"
        >
          Task Manager
        </button>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            className="flex items-center gap-2"
            onClick={() => navigate("/profile")}
          >
            <UserCircle className="h-5 w-5" />
            Hi, {displayName}
          </Button>
          <Button variant="outline" onClick={() => signOut()}>
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  );
}
