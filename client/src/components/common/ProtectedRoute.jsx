import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Skeleton } from '../ui';

/**
 * ProtectedRoute: Enforces authentication and role verification
 * @param {Array<String>} allowedRoles - e.g. ['student'] or ['admin']
 */
export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, role, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-secondary-600">Verifying security credentials...</p>
      </div>
    );
  }

  // If not authenticated, redirect to appropriate login portal
  if (!isAuthenticated) {
    const isTargetingAdmin = allowedRoles && allowedRoles.includes('admin') && !allowedRoles.includes('student');
    const redirectPath = isTargetingAdmin ? '/admin/login' : '/login';
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // If role is restricted and user does not have permission
  if (allowedRoles && !allowedRoles.includes(role)) {
    // If student attempts to access admin route or vice-versa
    const fallback = role === 'admin' ? '/admin/dashboard' : '/student/dashboard';
    return <Navigate to={fallback} replace />;
  }

  return children;
};

export default ProtectedRoute;
