import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";

export default function AuthRoute({ children }) {
  const { token, user } = useAuthStore();

  if (token) {
    if (user?.role === "Admin") {
      return <Navigate to="/admin/users" replace />;
    }
    if (user?.role === "Staff") {
      return <Navigate to="/admin/products" replace />;
    }
    return <Navigate to="/home" replace />; 
  }

  return children;
}