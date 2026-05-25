import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import Button from "@/components/ui/Button";

export default function HomePage() {
  const navigate = useNavigate();

  // Lấy thông tin user và hàm đăng xuất từ Store
  const { user, logoutAction } = useAuthStore();

  const handleLogout = () => {
    logoutAction(); // Xóa token & user
    navigate("/auth/login"); // Chú ý: path của bạn có thể là /auth/login hoặc /login tùy bạn cấu hình trong App.jsx
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-mkhe-bg text-mkhe-text">
      <div className="w-full max-w-md text-center space-y-6 p-8 border border-mkhe-border/30 rounded-lg bg-mkhe-input/10 backdrop-blur-md shadow-xl">
        <h1 className="text-4xl font-logo font-bold text-gradient-gold animate-fade-in">
          MKHE Heritage
        </h1>

        <div className="space-y-2">
          <p className="text-sm text-mkhe-text/60 italic">
            Xin chào quý khách, bạn đã đăng nhập thành công bằng tài khoản:
          </p>
          <p className="text-lg font-semibold text-mkhe-primary tracking-wide">
            {user?.email || "Tài khoản ẩn danh"}
          </p>
        </div>

        <div className="border-t border-mkhe-border/30 pt-6">
          <Button
            onClick={handleLogout}
            className="max-w-[180px] mx-auto py-2.5 text-sm"
          >
            Đăng xuất
          </Button>
        </div>
      </div>
    </div>
  );
}
