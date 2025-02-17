import { Suspense, lazy } from "react";
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./components/auth/AuthProvider";
import { LanguageProvider } from "./lib/i18n/LanguageContext";
import { useAuth } from "./lib/auth";
import { Toaster } from "@/components/ui/toaster";

// Lazy load components
const Home = lazy(() => import("./components/home"));
const SettingsView = lazy(() => import("./components/settings/SettingsView"));
const AuthForm = lazy(() =>
  import("./components/auth/AuthForm").then((m) => ({ default: m.AuthForm })),
);
const ProfileForm = lazy(() =>
  import("./components/auth/ProfileForm").then((m) => ({
    default: m.ProfileForm,
  })),
);
const SuccessSignup = lazy(() => import("./components/auth/SuccessSignup"));
const HabitView = lazy(() => import("./components/habits/HabitView"));
const BadgeView = lazy(() => import("./components/badges/BadgeView"));
const AdminLayout = lazy(() =>
  import("./components/admin/AdminLayout").then((m) => ({
    default: m.AdminLayout,
  })),
);
const ScriptsManager = lazy(() =>
  import("./components/admin/ScriptsManager").then((m) => ({
    default: m.ScriptsManager,
  })),
);
const BlogManager = lazy(() =>
  import("./components/admin/BlogManager").then((m) => ({
    default: m.BlogManager,
  })),
);
const PageManager = lazy(() =>
  import("./components/admin/PageManager").then((m) => ({
    default: m.PageManager,
  })),
);
const BlogList = lazy(() =>
  import("./components/blog/BlogList").then((m) => ({ default: m.BlogList })),
);
const BlogPost = lazy(() =>
  import("./components/blog/BlogPost").then((m) => ({ default: m.BlogPost })),
);
const BlogLayout = lazy(() =>
  import("./components/blog/BlogLayout").then((m) => ({
    default: m.BlogLayout,
  })),
);
const LandingPage = lazy(() => import("./components/landing/LandingPage"));
const PageView = lazy(() => import("./components/pages/PageView"));

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
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-gray-50 flex flex-col">
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
              <Route path="/" element={<LandingPage />} />
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
        </AuthProvider>
      </div>
    </LanguageProvider>
  );
}

export default App;
