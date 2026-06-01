import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { applyTheme } from "@/utils/theme";
import { isVideoUrl } from "@/utils/validators";
import toast from "react-hot-toast";
import logo from "@/assets/images/logo-mkhe.png";
import { useTranslation } from "react-i18next";
import {
  Search,
  ShoppingCart,
  Globe,
  Moon,
  Sun,
  Check,
  ChevronRight,
  ChevronLeft,
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
  const location = useLocation();
  const { user, logoutAction } = useAuthStore();

  // Check if user is admin or staff
  const isAdmin = user?.role === "Admin";
  const isStaff = user?.role === "Staff";
  const isAdminOrStaff = isAdmin || isStaff;

  // AVATAR CÓ PHẢI LÀ VIDEO KHÔNG
  const isAvatarVideo = isVideoUrl(user?.avatar);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("main");
  const [isGuestLangOpen, setIsGuestLangOpen] = useState(false);

  const dropdownRef = useRef(null);
  const guestLangRef = useRef(null);

  const [isDark, setIsDark] = useState(() => {
    // Init từ localStorage
    const theme = localStorage.getItem("theme");
    if (theme === "dark") {
      return true;
    } else if (theme === "light") {
      return false;
    }
    // Fallback: check system preference
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    if (isDark) {
      document.body.classList.add("dark-mode");
      applyTheme(true);
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark-mode");
      applyTheme(false);
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        setTimeout(() => setActiveMenu("main"), 200);
      }
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
    <header className="h-20 border-b border-mkhe-border bg-mkhe-bg flex items-center justify-between px-10 shrink-0 relative z-50 text-current transition-colors duration-300">
      {/* LOGO */}
      <div className="w-1/4">
        <Link
          to="/home"
          className="flex items-center gap-3 select-none cursor-pointer"
        >
          <img
            src={logo}
            alt="MKHE Logo"
            className="h-9 w-auto object-contain"
          />
          <span className="text-3xl font-logo font-bold tracking-wider text-gradient-gold">
            MKHE
          </span>
        </Link>
      </div>

      {/* THANH ĐIỀU HƯỚNG Ở GIỮA */}
      <nav className="flex-1 flex justify-center gap-8 hidden lg:flex">
        {!isAdminOrStaff ? (
          navLinks.map((link) => (
            <Link
              key={link.key}
              to={link.path}
              className="text-sm font-medium opacity-80 hover:opacity-100 hover:text-mkhe-primary cursor-pointer transition-colors uppercase tracking-wider text-[11px]"
            >
              {t(`nav.${link.key}`)}
            </Link>
          ))
        ) : (
          <div className="text-gradient-gold font-logo text-lg font-bold tracking-widest uppercase select-none">
            {isStaff ? t("user_menu.staff_area") : t("user_menu.admin_area")}
          </div>
        )}
      </nav>

      {/* CỤM CHỨC NĂNG BÊN PHẢI */}
      <div className="w-1/4 flex items-center justify-end gap-5">
        {/* ẨN KÍNH LÚP VÀ GIỎ HÀNG KHI LÀ ADMIN HOẶC STAFF */}
        {!isAdminOrStaff && (
          <>
            <button className="opacity-80 hover:opacity-100 cursor-pointer hover:text-mkhe-primary transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <button className="opacity-80 hover:opacity-100 cursor-pointer hover:text-mkhe-primary transition-colors relative">
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-mkhe-primary text-[#1a110a] text-[10px] font-bold rounded-full flex items-center justify-center">
                0
              </span>
            </button>
          </>
        )}

        {/* TRƯỜNG HỢP ĐÃ ĐĂNG NHẬP */}
        {user ? (
          <div className="relative ml-2" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-9 h-9 rounded-full border border-mkhe-primary/50 overflow-hidden hover:opacity-80 transition-opacity cursor-pointer flex items-center justify-center"
            >
              {user.avatar ? (
                isAvatarVideo ? (
                  <video
                    src={user.avatar}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={user.avatar}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                )
              ) : (
                <div className="w-full h-full bg-mkhe-primary/20 flex items-center justify-center font-bold text-mkhe-primary text-sm uppercase">
                  {(user.name || user.email)[0]}
                </div>
              )}
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-6 w-60 bg-mkhe-input border border-mkhe-border rounded-lg shadow-xl py-2 z-50">
                {activeMenu === "main" && (
                  <div>
                    <Link
                      to="/profile"
                      onClick={() => setIsDropdownOpen(false)}
                      className={`block mx-2 px-3 py-2 rounded-md text-sm cursor-pointer transition-colors ${
                        location.pathname.startsWith("/profile")
                          ? "text-mkhe-primary hover:bg-mkhe-primary/10"
                          : "opacity-80 hover:opacity-100 hover:bg-mkhe-primary/10"
                      }`}
                    >
                      {t("user_menu.profile")}
                    </Link>

                    {/* VÙNG CHỨC NĂNG DÀNH CHO ADMIN VÀ STAFF */}
                    {(user.role === "Admin" || user.role === "Staff") && (
                      <div className="py-1">
                        <div className="h-px bg-mkhe-border/50 my-1 mx-4"></div>

                        {/* Chỉ Admin mới thấy Quản lý Người dùng */}
                        {user.role === "Admin" && (
                          <Link
                            to="/admin/users"
                            onClick={() => setIsDropdownOpen(false)}
                            className={`block mx-2 px-3 py-2 rounded-md text-sm cursor-pointer transition-colors ${
                              location.pathname.startsWith("/admin/users")
                                ? "text-mkhe-primary hover:bg-mkhe-primary/10"
                                : "opacity-80 hover:opacity-100 hover:bg-mkhe-primary/10"
                            }`}
                          >
                            {t("user_menu.manage_users")}
                          </Link>
                        )}

                        {/* Cả Admin và Staff đều thấy Quản lý Sản phẩm */}
                        <Link
                          to="/admin/products"
                          onClick={() => setIsDropdownOpen(false)}
                          className={`block mx-2 px-3 py-2 rounded-md text-sm cursor-pointer transition-colors ${
                            location.pathname.startsWith("/admin/products")
                              ? "text-mkhe-primary hover:bg-mkhe-primary/10"
                              : "opacity-80 hover:opacity-100 hover:bg-mkhe-primary/10"
                          }`}
                        >
                          {t("user_menu.manage_products")}
                        </Link>

                        {/* Chỉ Admin mới thấy Thống kê - Phân tích */}
                        {user.role === "Admin" && (
                          <Link
                            to="/admin/analysis"
                            onClick={() => setIsDropdownOpen(false)}
                            className={`block mx-2 px-3 py-2 rounded-md text-sm cursor-pointer transition-colors ${
                              location.pathname.startsWith("/admin/analysis")
                                ? "text-mkhe-primary hover:bg-mkhe-primary/10"
                                : "opacity-80 hover:opacity-100 hover:bg-mkhe-primary/10"
                            }`}
                          >
                            {t("user_menu.analytics")}
                          </Link>
                        )}
                      </div>
                    )}

                    <div className="h-px bg-mkhe-border/30 my-2 mx-4"></div>

                    <button
                      onClick={() => setActiveMenu("language")}
                      className="w-[calc(100%-16px)] mx-2 text-left px-3 py-2 rounded-md text-sm opacity-80 flex justify-between items-center cursor-pointer hover:opacity-100 hover:bg-mkhe-primary/10 transition-colors"
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

                    <button
                      onClick={() => setIsDark(!isDark)}
                      className="w-[calc(100%-16px)] mx-2 px-3 py-2 rounded-md text-sm opacity-80 flex justify-between items-center cursor-pointer hover:opacity-100 hover:bg-mkhe-primary/10 transition-colors border-none bg-transparent text-current font-inherit"
                    >
                      <div className="flex items-center gap-3">
                        {isDark ? (
                          <Moon className="w-4 h-4" />
                        ) : (
                          <Sun className="w-4 h-4" />
                        )}{" "}
                        {t("settings.theme")}
                      </div>
                      <div
                        className={`w-10 h-5.5 rounded-full flex items-center px-1 transition-colors duration-300 ${isDark ? "bg-mkhe-primary" : "bg-gray-500"}`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-300 ${isDark ? "translate-x-4" : "translate-x-0"}`}
                        />
                      </div>
                    </button>

                    <div className="h-px bg-mkhe-border my-2 mx-4"></div>

                    <button
                      onClick={handleLogout}
                      className="w-[calc(100%-16px)] mx-2 text-left px-3 py-2 rounded-md text-sm opacity-80 text-red-500 cursor-pointer hover:opacity-100 hover:bg-red-500/10 transition-colors"
                    >
                      {t("user_menu.logout")}
                    </button>
                  </div>
                )}

                {activeMenu === "language" && (
                  <div>
                    <button
                      onClick={() => setActiveMenu("main")}
                      className="w-[calc(100%-16px)] mx-2 px-3 py-2 flex items-center gap-2 rounded-md text-sm font-semibold opacity-80 mb-1 cursor-pointer hover:opacity-100 hover:text-mkhe-primary hover:bg-mkhe-primary/10 transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" /> {t("settings.back")}
                    </button>

                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          i18n.changeLanguage(lang.code);
                          setActiveMenu("main");
                        }}
                        className="w-[calc(100%-16px)] mx-2 px-3 py-2 rounded-md text-left text-sm flex items-center justify-between cursor-pointer hover:bg-mkhe-primary/10 transition-colors"
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
          /* TRƯỜNG HỢP CHƯA ĐĂNG NHẬP */
          <div className="flex items-center gap-3 ml-2 border-l border-mkhe-border pl-4">
            <div className="relative" ref={guestLangRef}>
              <button
                onClick={() => setIsGuestLangOpen(!isGuestLangOpen)}
                className="opacity-60 hover:opacity-100 hover:text-mkhe-primary cursor-pointer transition-colors flex items-center gap-1 text-xs font-semibold uppercase"
              >
                <Globe className="w-4 h-4" /> {currentLang.short}
              </button>

              {isGuestLangOpen && (
                <div className="absolute right-0 mt-4 w-32 bg-mkhe-input border border-mkhe-border rounded-md shadow-xl py-1 z-50">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        i18n.changeLanguage(lang.code);
                        setIsGuestLangOpen(false);
                      }}
                      className="w-[calc(100%-16px)] mx-2 px-3 py-2 rounded-md text-left text-xs flex items-center justify-between cursor-pointer hover:bg-mkhe-primary/10 transition-colors"
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

            <button
              onClick={() => setIsDark(!isDark)}
              className="opacity-60 hover:opacity-100 hover:text-mkhe-primary cursor-pointer transition-colors"
            >
              {isDark ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4" />
              )}
            </button>

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
