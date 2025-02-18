import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";

export function MobileNav({ isAdmin }: { isAdmin?: boolean }) {
  const { signOut } = useAuth();
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        <nav className="flex flex-col gap-4">
          {isAdmin ? (
            <>
              <Link
                to="/admin/pages"
                className="block px-2 py-1 text-lg font-medium hover:text-primary"
              >
                Pages
              </Link>
              <Link
                to="/admin/blog"
                className="block px-2 py-1 text-lg font-medium hover:text-primary"
              >
                Blog Posts
              </Link>
              <Link
                to="/admin/scripts"
                className="block px-2 py-1 text-lg font-medium hover:text-primary"
              >
                Scripts
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/home"
                className="block px-2 py-1 text-lg font-medium hover:text-primary"
              >
                Tasks
              </Link>
              <Link
                to="/habits"
                className="block px-2 py-1 text-lg font-medium hover:text-primary"
              >
                Habits
              </Link>
              <Link
                to="/badges"
                className="block px-2 py-1 text-lg font-medium hover:text-primary"
              >
                Badges
              </Link>
              <Link
                to="/blog"
                className="block px-2 py-1 text-lg font-medium hover:text-primary"
              >
                Blog
              </Link>
            </>
          )}
          <Link
            to="/settings"
            className="block px-2 py-1 text-lg font-medium hover:text-primary"
          >
            Settings
          </Link>
          <Link
            to="/profile"
            className="block px-2 py-1 text-lg font-medium hover:text-primary"
          >
            Profile
          </Link>
          <Button
            variant="ghost"
            onClick={() => signOut()}
            className="w-full justify-start px-2 py-1 text-lg font-medium hover:text-primary"
          >
            Sign Out
          </Button>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
