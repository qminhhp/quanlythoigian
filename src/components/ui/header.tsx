import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

export function Header() {
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">ConquerDay</span>
          </Link>
        </div>

        <div className="flex items-center justify-between flex-1">
          {user ? (
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link
                to="/home"
                className="transition-colors hover:text-foreground/80 text-foreground"
              >
                Tasks
              </Link>
              <Link
                to="/habits"
                className="transition-colors hover:text-foreground/80 text-foreground"
              >
                Habits
              </Link>
              <Link
                to="/badges"
                className="transition-colors hover:text-foreground/80 text-foreground"
              >
                Badges
              </Link>
              <Link
                to="/blog"
                className="transition-colors hover:text-foreground/80 text-foreground"
              >
                Blog
              </Link>
            </nav>
          ) : (
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link
                to="/blog"
                className="transition-colors hover:text-foreground/80 text-foreground"
              >
                Blog
              </Link>
            </nav>
          )}

          <nav className="flex items-center space-x-2">
            {user ? (
              <>
                <Link to="/settings">
                  <Button variant="ghost" className="px-4">
                    Settings
                  </Button>
                </Link>
                <Link to="/profile">
                  <Button variant="ghost" className="px-4">
                    Profile
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  className="px-4"
                  onClick={() => signOut()}
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button className="px-4">Get Started</Button>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
