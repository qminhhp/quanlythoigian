import { Suspense, useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./components/home";
import SettingsView from "./components/settings/SettingsView";
import { AuthForm } from "./components/auth/AuthForm";
import { ProfileForm } from "./components/auth/ProfileForm";
import { AuthProvider } from "./components/auth/AuthProvider";
import { LanguageProvider } from "./lib/i18n/LanguageContext";
import { useAuth } from "./lib/auth";
import SuccessSignup from "./components/auth/SuccessSignup";
import HabitView from "./components/habits/HabitView";
import BadgeView from "./components/badges/BadgeView";
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/react";
import { AdminLayout } from "./components/admin/AdminLayout";
import { ScriptsManager } from "./components/admin/ScriptsManager";
import { BlogManager } from "./components/admin/BlogManager";
import { PageManager } from "./components/admin/PageManager";
import { Footer } from "./components/ui/footer";
import { BlogList } from "./components/blog/BlogList";
import { BlogPost } from "./components/blog/BlogPost";
import { BlogLayout } from "./components/blog/BlogLayout";
import LandingPage from "./components/landing/LandingPage";
import PageView from "./components/pages/PageView";
import { supabase } from "./lib/supabase";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

function App() {
  const [scripts, setScripts] = useState({ header: "", footer: "" });

  useEffect(() => {
    const loadScripts = async () => {
      const { data } = await supabase.from("scripts").select("*");
      if (data) {
        const header = data.find((s) => s.type === "header");
        const footer = data.find((s) => s.type === "footer");
        setScripts({
          header: header?.content || "",
          footer: footer?.content || "",
        });
      }
    };

    loadScripts();
  }, []);

  document.title =
    window.location.hostname === "quanlythoigian.com"
      ? "Quản Lý Thời Gian"
      : "ConquerDay - Time Management App";
  console.log("Current hostname:", window.location.hostname); // Debug log

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {scripts.header && (
        <div dangerouslySetInnerHTML={{ __html: scripts.header }} />
      )}
      <LanguageProvider>
        <AuthProvider>
          <Suspense
            fallback={
              <div className="flex items-center justify-center min-h-screen">
                <p className="text-lg">Loading...</p>
              </div>
            }
          >
            <Routes>
              {/* Tempo routes */}
              {import.meta.env.VITE_TEMPO === "true" && (
                <Route path="/tempobook/*" element={<div />} />
              )}

              {/* Auth routes */}
              <Route path="/auth" element={<AuthForm />} />
              <Route path="/auth/success" element={<SuccessSignup />} />

              {/* Protected routes */}
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <ProfileForm />
                  </PrivateRoute>
                }
              />
              <Route path="/" element={<PageView />} />
              <Route
                path="/home"
                element={
                  <PrivateRoute>
                    <Home />
                  </PrivateRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <PrivateRoute>
                    <SettingsView />
                  </PrivateRoute>
                }
              />
              <Route
                path="/habits"
                element={
                  <PrivateRoute>
                    <HabitView />
                  </PrivateRoute>
                }
              />
              <Route
                path="/badges"
                element={
                  <PrivateRoute>
                    <BadgeView />
                  </PrivateRoute>
                }
              />

              {/* Admin routes */}
              <Route
                path="/admin"
                element={
                  <PrivateRoute>
                    <AdminLayout>
                      <Navigate to="/admin/pages" replace />
                    </AdminLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/scripts"
                element={
                  <PrivateRoute>
                    <AdminLayout>
                      <ScriptsManager />
                    </AdminLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/blog"
                element={
                  <PrivateRoute>
                    <AdminLayout>
                      <BlogManager />
                    </AdminLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/pages"
                element={
                  <PrivateRoute>
                    <AdminLayout>
                      <PageManager />
                    </AdminLayout>
                  </PrivateRoute>
                }
              />

              {/* Pages route */}
              <Route path="/:slug" element={<PageView />} />

              {/* Blog routes */}
              {/* Blog routes - accessible to both logged-in and non-logged-in users */}
              <Route
                path="/blog/*"
                element={
                  <BlogLayout>
                    <Routes>
                      <Route path="/" element={<BlogList />} />
                      <Route path="/:slug" element={<BlogPost />} />
                      <Route
                        path="/category/:category"
                        element={<BlogList />}
                      />
                    </Routes>
                  </BlogLayout>
                }
              />

              {/* Catch-all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
          <Toaster />
          <Analytics />
          <Footer />
        </AuthProvider>
      </LanguageProvider>
      {scripts.footer && (
        <div dangerouslySetInnerHTML={{ __html: scripts.footer }} />
      )}
    </div>
  );
}

export default App;
