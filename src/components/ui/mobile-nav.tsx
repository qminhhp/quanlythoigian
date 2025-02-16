import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Link } from "react-router-dom";

export function MobileNav() {
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
        </nav>
      </SheetContent>
    </Sheet>
  );
}
