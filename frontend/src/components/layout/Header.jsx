import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import logo from "@/assets/images/logo-mkhe.png"; // Gọi Logo cực lẹ bằng Alias @

export default function Header() {
  const { i18n } = useTranslation();
  const [isLight, setIsLight] = useState(false);

  // Kích hoạt Sáng/Tối
  const toggleTheme = () => {
    setIsLight(!isLight);
  };

  useEffect(() => {
    if (isLight) {
      document.body.classList.add("light-mode");
    } else {
      document.body.classList.remove("light-mode");
    }
  }, [isLight]);

  // Đổi ngôn ngữ
  const toggleLanguage = () => {
    const nextLang = i18n.language === "vi" ? "en" : "vi";
    i18n.changeLanguage(nextLang);
  };

  return (
    <header className="flex justify-between items-center px-8 py-4 bg-mkhe-input border-b border-mkhe-border transition-colors duration-300">
      <div className="flex items-center gap-3 select-none">
        <img src={logo} alt="MKHE Logo" className="h-9 w-auto object-contain" />
        <span className="text-3xl font-logo font-bold tracking-wider text-gradient-gold">
          MKHE
        </span>
      </div>

      <div className="flex gap-2">
        <button
          onClick={toggleLanguage}
          className="px-3 py-1.5 border border-mkhe-primary text-mkhe-primary text-sm font-semibold rounded cursor-pointer hover:bg-mkhe-primary hover:text-white transition-colors duration-200"
        >
          {i18n.language === "vi" ? "EN" : "VI"}
        </button>

        <button
          onClick={toggleTheme}
          className="px-3 py-1.5 border border-mkhe-primary text-mkhe-primary text-sm font-semibold rounded cursor-pointer hover:bg-mkhe-primary hover:text-white transition-colors duration-200"
        >
          {isLight ? "🌙 Dark" : "☀️ Light"}
        </button>
      </div>
    </header>
  );
}
