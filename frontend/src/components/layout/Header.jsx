import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import {
  Search,
  ShoppingCart,
  Globe,
  Moon,
  Sun,
  Check,
  ChevronRight,
  ChevronLeft, // Thêm Mũi tên trái cho nút Back
} from "lucide-react";

const LANGUAGES = [
  { code: "vi", label: "Tiếng Việt", short: "VI" },
  { code: "en", label: "English", short: "EN" },
  { code: "zh", label: "中文", short: "ZH" },
  { code: "ko", label: "한국어", short: "KO" },
];

export default function Header() {
  const { t, i18n } = useTranslation("header");
  const navigate = useNavigate();
  const { user, logoutAction } = useAuthStore();

  // State quản lý Dropdown
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("main"); // 'main' hoặc 'language'
  const [isGuestLangOpen, setIsGuestLangOpen] = useState(false);

  const dropdownRef = useRef(null);
  const guestLangRef = useRef(null);

  // 1. Khởi tạo theme từ LocalStorage
  const [isLight, setIsLight] = useState(() => {
    return localStorage.getItem("theme") === "light";
  });

  // 2. Lưu Theme và thay class
  useEffect(() => {
    if (isLight) {
      document.body.classList.add("light-mode");
      localStorage.setItem("theme", "light");
    } else {
      document.body.classList.remove("light-mode");
      localStorage.setItem("theme", "dark");
    }
  }, [isLight]);

  // Đóng các menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Đóng menu Customer
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        setTimeout(() => setActiveMenu("main"), 200); // Trả về menu chính khi đóng
      }
      // Đóng menu Guest
      if (
        guestLangRef.current &&
        !guestLangRef.current.contains(event.target)
      ) {
        setIsGuestLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logoutAction();
    setIsDropdownOpen(false);
    toast.success(t("messages.logout_success"));
    navigate("/login");
  };

  const navLinks = [
    { key: "heritage", path: "/heritage" },
    { key: "craft_villages", path: "/craft-villages" },
    { key: "shop", path: "/shop" },
    { key: "storytelling", path: "/storytelling" },
    { key: "values", path: "/values" },
  ];

  const currentLang =
    LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[0];

  return (
    <header className="h-20 border-b border-mkhe-border bg-mkhe-bg flex items-center justify-between px-10 shrink-0 relative z-50 transition-colors duration-300 text-current">
      {/* LOGO GẮN LINK VỀ HOME */}
      <div className="w-1/4">
        <Link
          to="/home"
          className="flex items-center gap-3 select-none hover:opacity-80 transition-opacity cursor-pointer"
        >
          <span className="text-3xl font-logo font-bold tracking-widest text-gradient-gold">
            MKHE
          </span>
        </Link>
      </div>

      {/* MENU CHÍNH Ở GIỮA */}
      <nav className="flex-1 flex justify-center gap-8 hidden lg:flex">
        {navLinks.map((link) => (
          <Link
            key={link.key}
            to={link.path}
            className="text-sm font-medium opacity-80 hover:opacity-100 hover:text-mkhe-primary cursor-pointer transition-colors uppercase tracking-wider text-[11px]"
          >
            {t(`nav.${link.key}`)}
          </Link>
        ))}
      </nav>

      {/* CỤM BÊN PHẢI */}
      <div className="w-1/4 flex items-center justify-end gap-5">
        <button className="opacity-80 hover:opacity-100 cursor-pointer hover:text-mkhe-primary transition-colors">
          <Search className="w-5 h-5" />
        </button>
        <button className="opacity-80 hover:opacity-100 cursor-pointer hover:text-mkhe-primary transition-colors relative">
          <ShoppingCart className="w-5 h-5" />
          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-mkhe-primary text-[#1a110a] text-[10px] font-bold rounded-full flex items-center justify-center">
            0
          </span>
        </button>

        {/* ========================================================= */}
        {/* TRƯỜNG HỢP 1: ĐÃ ĐĂNG NHẬP (CUSTOMER)                     */}
        {/* ========================================================= */}
        {user ? (
          <div className="relative ml-2" ref={dropdownRef}>
            {/* NÚT AVATAR */}
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-9 h-9 rounded-full border border-mkhe-primary/50 overflow-hidden hover:opacity-80 transition-opacity cursor-pointer"
            >
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-mkhe-primary/20 flex items-center justify-center font-bold text-mkhe-primary text-sm uppercase">
                  {(user.name || user.email)[0]}
                </div>
              )}
            </button>

            {/* DROPDOWN MENU CHÍNH */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-6 w-60 bg-mkhe-input border border-mkhe-border rounded-lg shadow-xl overflow-hidden py-2 z-50">
                {/* --- TRẠNG THÁI 1: MENU CHÍNH --- */}
                {activeMenu === "main" && (
                  <div>
                    <Link
                      to="/profile"
                      className="block px-4 py-2.5 text-sm opacity-80 cursor-pointer hover:text-mkhe-primary hover:bg-mkhe-primary/10 transition-colors"
                    >
                      {t("user_menu.profile")}
                    </Link>
                    {(user.role === "Admin" || user.role === "Staff") && (
                      <Link
                        to="/admin/dashboard"
                        className="block px-4 py-2.5 text-sm text-mkhe-primary font-semibold cursor-pointer hover:bg-mkhe-primary/10 transition-colors"
                      >
                        {t("user_menu.admin")}
                      </Link>
                    )}

                    <div className="h-px bg-mkhe-border my-2 mx-3"></div>

                    {/* NÚT VÀO SUB-MENU NGÔN NGỮ */}
                    <button
                      onClick={() => setActiveMenu("language")}
                      className="w-full text-left px-4 py-2.5 text-sm opacity-80 flex justify-between items-center cursor-pointer hover:text-mkhe-primary hover:bg-mkhe-primary/10 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Globe className="w-4 h-4" /> {t("settings.language")}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-semibold">
                          {currentLang.short}
                        </span>
                        <ChevronRight className="w-4 h-4 opacity-50" />
                      </div>
                    </button>

                    {/* NÚT GẠT (TOGGLE) GIAO DIỆN SÁNG/TỐI */}
                    <div
                      onClick={() => setIsLight(!isLight)}
                      className="w-full px-4 py-2.5 text-sm opacity-80 flex justify-between items-center cursor-pointer hover:text-mkhe-primary hover:bg-mkhe-primary/10 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {isLight ? (
                          <Sun className="w-4 h-4" />
                        ) : (
                          <Moon className="w-4 h-4" />
                        )}{" "}
                        {t("settings.theme")}
                      </div>

                      {/* Nút gạt dạng iOS */}
                      <div
                        className={`w-10 h-5.5 rounded-full flex items-center px-1 transition-colors duration-300 ${isLight ? "bg-mkhe-primary" : "bg-gray-500"}`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-300 ${isLight ? "translate-x-4" : "translate-x-0"}`}
                        />
                      </div>
                    </div>

                    <div className="h-px bg-mkhe-border my-2 mx-3"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-400 cursor-pointer hover:bg-red-400/10 transition-colors"
                    >
                      {t("user_menu.logout")}
                    </button>
                  </div>
                )}

                {/* --- TRẠNG THÁI 2: MENU LỒNG CHỌN NGÔN NGỮ --- */}
                {activeMenu === "language" && (
                  <div>
                    {/* Nút Back quay lại Menu Chính */}
                    <button
                      onClick={() => setActiveMenu("main")}
                      className="w-full px-4 py-3 flex items-center gap-2 text-sm font-semibold opacity-90 border-b border-mkhe-border mb-1 cursor-pointer hover:text-mkhe-primary hover:bg-mkhe-primary/5 transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" /> Trở lại
                    </button>

                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          i18n.changeLanguage(lang.code);
                          setActiveMenu("main"); // Chọn xong tự động quay về menu chính
                        }}
                        className="w-full px-6 py-3 text-left text-sm flex items-center justify-between cursor-pointer hover:bg-mkhe-primary/10 transition-colors"
                      >
                        <span
                          className={
                            i18n.language === lang.code
                              ? "text-mkhe-primary font-semibold"
                              : "opacity-80"
                          }
                        >
                          {lang.label}
                        </span>
                        {i18n.language === lang.code && (
                          <Check className="w-4 h-4 text-mkhe-primary" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* ========================================================= */
          /* TRƯỜNG HỢP 2: CHƯA ĐĂNG NHẬP (GUEST)                      */
          /* ========================================================= */
          <div className="flex items-center gap-3 ml-2 border-l border-mkhe-border pl-4">
            {/* Menu Dropdown Ngôn ngữ Guest */}
            <div className="relative" ref={guestLangRef}>
              <button
                onClick={() => setIsGuestLangOpen(!isGuestLangOpen)}
                className="opacity-60 hover:opacity-100 hover:text-mkhe-primary cursor-pointer transition-colors flex items-center gap-1 text-xs font-semibold uppercase"
              >
                <Globe className="w-4 h-4" /> {currentLang.short}
              </button>

              {isGuestLangOpen && (
                <div className="absolute right-0 mt-4 w-32 bg-mkhe-input border border-mkhe-border rounded shadow-xl overflow-hidden py-1 z-50">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        i18n.changeLanguage(lang.code);
                        setIsGuestLangOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-xs flex items-center justify-between cursor-pointer hover:bg-mkhe-primary/10 transition-colors"
                    >
                      <span
                        className={
                          i18n.language === lang.code
                            ? "text-mkhe-primary font-semibold"
                            : "opacity-70"
                        }
                      >
                        {lang.label}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Nút Toggle Theme Guest */}
            <button
              onClick={() => setIsLight(!isLight)}
              className="opacity-60 hover:opacity-100 hover:text-mkhe-primary cursor-pointer transition-colors"
            >
              {isLight ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>

            {/* Nút Login Guest */}
            <Link
              to="/login"
              className="text-xs uppercase tracking-wider font-semibold text-mkhe-primary border border-mkhe-primary px-4 py-1.5 rounded hover:bg-mkhe-primary hover:text-white transition-all ml-1 cursor-pointer"
            >
              {t("guest_menu.login")}
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
