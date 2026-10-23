import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm text-muted">Loading...</p>
      </div>
    </div>
  );
}

// Protect routes for authenticated students only
export function StudentRoute() {
  const { user, loading, isStudent } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (!isStudent) return <Navigate to="/admin/dashboard" replace />;

  return <Outlet />;
}

// Protect routes for authenticated admins only
export function AdminRoute() {
  const { user, loading, isAdmin } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/admin/login" replace />;
  if (!isAdmin) return <Navigate to="/student/dashboard" replace />;

  return <Outlet />;
}

// Redirect to dashboard if already authenticated
export function GuestRoute() {
  const { user, loading, isStudent, isAdmin } = useAuth();

  if (loading) return <LoadingScreen />;
  if (user && isStudent) return <Navigate to="/student/dashboard" replace />;
  if (user && isAdmin) return <Navigate to="/admin/dashboard" replace />;

  return <Outlet />;
}
