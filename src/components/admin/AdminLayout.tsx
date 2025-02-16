import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
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
      const { data, error } = await supabase
        .from("admin_users")
        .select("id")
        .eq("id", user.id)
        .single();

      console.log("AdminLayout: Admin check result:", { data, error });

      if (!data) {
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
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold">Admin Dashboard</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <a
                  href="/admin/pages"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Pages
                </a>
                <a
                  href="/admin/blog"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Blog Posts
                </a>
                <a
                  href="/admin/scripts"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Scripts
                </a>
              </div>
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
