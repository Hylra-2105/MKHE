import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";

export default function AuthRoute({ children }) {
  const { token } = useAuthStore();

  if (token) {
    return <Navigate to="/home" replace />; 
  }

  return children;
}