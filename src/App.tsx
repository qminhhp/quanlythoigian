import { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./components/home";
import SettingsView from "./components/settings/SettingsView";
import { AuthForm } from "./components/auth/AuthForm";
import { ProfileForm } from "./components/auth/ProfileForm";
import { AuthProvider } from "./components/auth/AuthProvider";
import { useAuth } from "./lib/auth";
import SuccessSignup from "./components/auth/SuccessSignup";
import { Toaster } from "@/components/ui/toaster";

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
    <div className="min-h-screen bg-gray-50">
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
            <Route path="/" element={<AuthForm />} />
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

            {/* Catch-all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
        <Toaster />
      </AuthProvider>
    </div>
  );
}

export default App;
