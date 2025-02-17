import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useAuth();
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      if (user) {
        const admin = await isAdmin();
        setIsAdminUser(admin);
      }
      setCheckingAdmin(false);
    };

    checkAdmin();
  }, [user, isAdmin]);

  if (loading || checkingAdmin) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isAdminUser) {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
}
