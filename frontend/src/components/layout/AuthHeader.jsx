import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import logo from "@/assets/images/logo-mkhe.png";
import { Globe, Moon, Sun } from "lucide-react";
import { Link } from "react-router-dom";

export default function AuthHeader() {
  const { i18n } = useTranslation();

  // 1. Lấy trạng thái lưu trữ từ trình duyệt
  const [isLight, setIsLight] = useState(() => {
    return localStorage.getItem("theme") === "light";
  });

  // 2. Kích hoạt class body & lưu lại lựa chọn
  useEffect(() => {
    if (isLight) {
      document.body.classList.add("light-mode");
      localStorage.setItem("theme", "light");
    } else {
      document.body.classList.remove("light-mode");
      localStorage.setItem("theme", "dark");
    }
  }, [isLight]);

  // Đổi ngôn ngữ nhanh
  const toggleLanguage = () => {
    const nextLang = i18n.language === "vi" ? "en" : "vi";
    i18n.changeLanguage(nextLang);
  };

  return (
    <header className="flex justify-between items-center px-8 py-4 bg-mkhe-input border-b border-mkhe-border transition-colors duration-300">
      {/* LOGO */}
      <Link
        to="/home"
        className="flex items-center gap-3 select-none cursor-pointer"
      >
        <img src={logo} alt="MKHE Logo" className="h-9 w-auto object-contain" />
        <span className="text-3xl font-logo font-bold tracking-wider text-gradient-gold">
          MKHE
        </span>
      </Link>

      {/* CỤM CHỨC NĂNG BÊN PHẢI VỚI ICON */}
      <div className="flex items-center gap-5">
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1.5 opacity-80 cursor-pointer hover:text-mkhe-primary hover:opacity-100 transition-colors font-semibold text-sm uppercase"
        >
          <Globe className="w-5 h-5" /> {i18n.language}
        </button>

        <button
          onClick={() => setIsLight(!isLight)}
          className="opacity-80 hover:text-mkhe-primary cursor-pointer hover:opacity-100 transition-colors"
        >
          {isLight ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>
    </header>
  );
}
