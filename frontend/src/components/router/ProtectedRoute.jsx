import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";


export default function ProtectedRoute({ children, allowedRoles }) {
  const { token, user } = useAuthStore();

  if (!token) {
    return <Navigate to="/login" replace />;
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
