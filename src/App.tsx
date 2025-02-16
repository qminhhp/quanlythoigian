import { Suspense } from "react";
import {
  Routes,
  Route,
  Navigate,
  useRoutes as useReactRoutes,
} from "react-router-dom";
import Home from "./components/home";
import SettingsView from "./components/settings/SettingsView";
import { AuthForm } from "./components/auth/AuthForm";
import { ProfileForm } from "./components/auth/ProfileForm";
import { AuthProvider } from "./components/auth/AuthProvider";
import { useAuth } from "./lib/auth";
import routes from "tempo-routes";
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
    <AuthProvider>
      <Suspense fallback={<p>Loading...</p>}>
        <Routes>
          {/* Tempo routes */}
          {import.meta.env.VITE_TEMPO === "true" && (
            <Route path="/tempobook/*" />
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
          <Route
            path="/"
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
  );
}

export default App;
