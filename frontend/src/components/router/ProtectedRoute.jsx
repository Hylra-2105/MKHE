import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";


export default function ProtectedRoute({ children, allowedRoles }) {
  const { token, user } = useAuthStore();
  const location = useLocation();

  if (!token) {
    const currentPath = location.pathname + location.search;
    return <Navigate to={`/login?redirect=${encodeURIComponent(currentPath)}`} replace />;
  }

  if (
    allowedRoles &&
    allowedRoles.length > 0 &&
    (!user || !allowedRoles.includes(user.role))
  ) {
    return <Navigate to="/403" replace />;
  }

  return children;
}
