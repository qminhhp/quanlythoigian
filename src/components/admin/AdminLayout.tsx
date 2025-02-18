import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { MobileNav } from "@/components/ui/mobile-nav";
import { Button } from "@/components/ui/button";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("AdminLayout: Checking auth...");
    if (!user) {
      console.log("AdminLayout: No user, redirecting to auth");
      navigate("/auth");
      return;
    }

    const checkAdmin = async () => {
      console.log("AdminLayout: Checking admin status...");
      const { data: isAdmin, error } = await supabase
        .rpc('is_admin', { user_id: user.id });

      console.log("AdminLayout: Admin check result:", { isAdmin, error });

      if (!isAdmin) {
        console.log("AdminLayout: Not an admin, redirecting to home");
        navigate("/home");
        return;
      }

      console.log("AdminLayout: Admin check passed");
    };

    checkAdmin();
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <MobileNav isAdmin={true} />
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold">Admin Dashboard</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/admin/pages"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Pages
                </Link>
                <Link
                  to="/admin/blog"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Blog Posts
                </Link>
                <Link
                  to="/admin/scripts"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Scripts
                </Link>
              </div>
            </div>
            <div className="hidden sm:flex sm:items-center sm:space-x-4">
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
                onClick={() => signOut()}
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>
      <main className="py-10">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
