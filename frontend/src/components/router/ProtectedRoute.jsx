import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";

export default function ProtectedRoute({ children }) {
  // Lấy token từ Zustand Store
  const { token } = useAuthStore();

  // Nếu CHƯA có token về trang /login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
