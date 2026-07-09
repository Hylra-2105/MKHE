import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { useCartStore } from "@/stores/useCartStore";
import { applyTheme } from "@/utils/theme";
import { isVideoMedia } from "@/utils/validators";
import toast from "react-hot-toast";
import logo from "@/assets/images/logo-mkhe.png";
import NotificationDropdown from "./NotificationDropdown";
import MiniCartDrawer from "./MiniCartDrawer";
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
  User,
  Users,
  Package,
  ShoppingBag,
  Ticket,
  BarChart,
  LogOut,
  FileText,
  Menu,
  Star,
  X,
  Mail,
  LayoutGrid,
} from "lucide-react";

const LANGUAGES = [
  { code: "vi", labelKey: "languages.vi", short: "VI" },
  { code: "en", labelKey: "languages.en", short: "EN" },
  { code: "zh", labelKey: "languages.zh", short: "ZH" },
  { code: "ko", labelKey: "languages.ko", short: "KO" },
  { code: "ja", labelKey: "languages.ja", short: "JA" },
];

export default function Header() {
  const { t, i18n } = useTranslation(["header", "history"]);
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const logoutAction = useAuthStore((state) => state.logoutAction);
  const { items, toggleCart } = useCartStore();

  // Check if user is admin or staff
  const isAdmin = user?.role === "Admin";
  const isStaff = user?.role === "Staff";
  const isAdminOrStaff = isAdmin || isStaff;

  // AVATAR CÓ PHẢI LÀ VIDEO KHÔNG
  const isAvatarVideo = isVideoMedia(user?.avatar);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("main");
  const [isGuestLangOpen, setIsGuestLangOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchKeyword.trim())}`);
      setIsSearchOpen(false);
      setSearchKeyword("");
    }
  };

  const dropdownRef = useRef(null);
  const guestLangRef = useRef(null);
  const searchRef = useRef(null);
  const searchToggleRef = useRef(null);
  const cartRef = useRef(null);

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
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target) &&
        searchToggleRef.current &&
        !searchToggleRef.current.contains(event.target)
      ) {
        setIsSearchOpen(false);
      }
      if (
        cartRef.current &&
        !cartRef.current.contains(event.target) &&
        !event.target.closest('.voucher-selector-drawer') &&
        useCartStore.getState().isCartOpen
      ) {
        useCartStore.getState().setCartOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      // Chiều cao màn hình trừ đi chiều cao Header (h-20 ~ 80px)
      setIsScrolled(window.scrollY > window.innerHeight - 80);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await logoutAction();
    setIsDropdownOpen(false);
    toast.success(t("messages.logout_success"));
    
    // Xử lý theo ngữ cảnh (Context-Aware Logout)
    const protectedRoutes = ["/profile", "/admin", "/checkout"];
    const isProtected = protectedRoutes.some((route) =>
      location.pathname.startsWith(route)
    );

    if (isProtected) {
      const currentPath = location.pathname + location.search;
      navigate(`/login?redirect=${encodeURIComponent(currentPath)}`);
    }
    // Nếu đang ở trang công khai (/home, /shop...) thì không navigate, giữ nguyên vị trí
  };

  const navLinks = [
    { key: "home", path: "/home" },
    { key: "about", path: "/about" },
    { key: "shop", path: "/shop" },
    { key: "storytelling", path: "/storytelling" },
    { key: "blog", path: "/blogs" },
    { key: "contact", path: "/contact" },
  ];

  const currentLang =
    LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[0];

  const isHomePage = location.pathname === "/home" || location.pathname === "/";
  const headerClasses = isHomePage && !isScrolled
    ? "bg-transparent border-transparent text-white drop-shadow-md" 
    : "bg-mkhe-bg border-mkhe-border text-current";

  const isActive = (path) => {
    if (path === "/home" && (location.pathname === "/" || location.pathname === "/home")) return true;
    if (path !== "/home" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className={`h-20 border-b flex items-center justify-between px-4 md:px-10 shrink-0 fixed top-0 left-0 w-full z-[60] transition-colors duration-300 ${headerClasses}`}>
      {/* LOGO AND MOBILE MENU */}
      <div className="flex-shrink-0 lg:w-1/4 flex items-center gap-3">
        {/* Hamburger Menu cho Mobile */}
        <button 
          className="lg:hidden p-1.5 opacity-80 hover:opacity-100 hover:text-mkhe-primary cursor-pointer relative z-50"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

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
          navLinks.map((link) => {
            const active = isActive(link.path);
            return (
            <Link
              key={link.key}
              to={link.path}
              className={`relative text-sm cursor-pointer transition-colors uppercase tracking-wider text-[11px] group py-1 ${
                active ? "text-mkhe-primary opacity-100 font-bold" : "opacity-80 hover:opacity-100 hover:text-mkhe-primary font-medium"
              }`}
            >
              {t(`nav.${link.key}`)}
              <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] bg-mkhe-primary rounded-full transition-all duration-300 ${
                active ? "w-full" : "w-0 group-hover:w-full opacity-50"
              }`}></span>
            </Link>
          )})
        ) : (
          <div className="text-gradient-gold font-logo text-lg font-bold tracking-widest uppercase select-none">
            {isStaff ? t("user_menu.staff_area") : t("user_menu.admin_area")}
          </div>
        )}
      </nav>

      {/* CỤM CHỨC NĂNG BÊN PHẢI */}
      <div className="flex-shrink-0 lg:w-1/4 flex items-center justify-end gap-3 md:gap-5">
        {/* ẨN KÍNH LÚP VÀ GIỎ HÀNG KHI LÀ ADMIN HOẶC STAFF */}
        {!isAdminOrStaff && (
          <>
            <button 
              ref={searchToggleRef}
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="opacity-80 hover:opacity-100 cursor-pointer hover:text-mkhe-primary transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
            <div className="relative flex items-center justify-center" ref={cartRef}>
              <button 
                onClick={toggleCart}
                className="opacity-80 hover:opacity-100 cursor-pointer hover:text-mkhe-primary transition-colors relative"
              >
                <ShoppingCart className="w-5 h-5" />
                {items.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-[16px] px-[3px] bg-mkhe-primary text-[#1a110a] text-[10px] leading-none font-bold rounded-full flex items-center justify-center pt-[1px]">
                    {items.length}
                  </span>
                )}
              </button>
              <MiniCartDrawer />
            </div>
          </>
        )}

        {/* TRƯỜNG HỢP ĐÃ ĐĂNG NHẬP */}
        {user ? (
          <>
            <NotificationDropdown />
            <div className="relative" ref={dropdownRef}>
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
                    referrerPolicy="no-referrer"
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
              <div className="absolute right-0 mt-6 w-60 max-w-[calc(100vw-2rem)] bg-mkhe-input border border-mkhe-border rounded-lg shadow-xl py-2 z-50 origin-top-right text-mkhe-text">
                {activeMenu === "main" && (
                  <div>
                    <Link
                      to="/profile"
                      onClick={() => setIsDropdownOpen(false)}
                      className={`mx-2 px-3 py-2 rounded-md text-sm cursor-pointer transition-colors flex items-center gap-3 ${
                        location.pathname.startsWith("/profile") && !location.search.includes("tab=orders")
                          ? "text-mkhe-primary hover:bg-mkhe-primary/10"
                          : "opacity-80 hover:opacity-100 hover:bg-mkhe-primary/10"
                      }`}
                    >
                      <User className="w-4 h-4" />
                      {t("user_menu.profile")}
                    </Link>

                    {/* Lịch sử đơn hàng */}
                    <Link
                      to="/profile?tab=orders"
                      onClick={() => setIsDropdownOpen(false)}
                      className={`mx-2 mt-1 px-3 py-2 rounded-md text-sm cursor-pointer transition-colors flex items-center gap-3 ${
                        location.search.includes("tab=orders")
                          ? "text-mkhe-primary hover:bg-mkhe-primary/10"
                          : "opacity-80 hover:opacity-100 hover:bg-mkhe-primary/10"
                      }`}
                    >
                      <ShoppingBag className="w-4 h-4" />
                      {t("history:title", { defaultValue: "Đơn hàng của tôi" })}
                    </Link>

                    {/* VÙNG DÀNH CHO KHÁCH HÀNG DOANH NGHIỆP (B2B) */}
                    {user.role === "Enterprise" && (
                      <Link
                        to="/b2b/dashboard"
                        onClick={() => setIsDropdownOpen(false)}
                        className={`mx-2 mt-1 px-3 py-2 rounded-md text-sm cursor-pointer transition-colors flex items-center gap-3 ${
                          location.pathname.startsWith("/b2b/dashboard")
                            ? "text-mkhe-primary hover:bg-mkhe-primary/10"
                            : "opacity-80 hover:opacity-100 hover:bg-mkhe-primary/10"
                        }`}
                      >
                        <LayoutGrid className="w-4 h-4" />
                        Dashboard B2B
                      </Link>
                    )}

                    {/* VÙNG CHỨC NĂNG DÀNH CHO ADMIN VÀ STAFF */}
                    {(user.role === "Admin" || user.role === "Staff") && (
                      <div className="py-1">
                        <div className="h-px bg-mkhe-border/50 my-1 mx-4"></div>

                        {/* ================= CỤM 1: CỐT LÕI ================= */}
                        {/* Thống kê - Phân tích (Admin only) */}
                        {user.role === "Admin" && (
                          <Link
                            to="/admin/analysis"
                            onClick={() => setIsDropdownOpen(false)}
                            className={`mx-2 px-3 py-2 rounded-md text-sm cursor-pointer transition-colors flex items-center gap-3 ${
                              location.pathname.startsWith("/admin/analysis")
                                ? "text-mkhe-primary hover:bg-mkhe-primary/10"
                                : "opacity-80 hover:opacity-100 hover:bg-mkhe-primary/10"
                            }`}
                          >
                            <BarChart className="w-4 h-4" />
                            {t("user_menu.analytics")}
                          </Link>
                        )}

                        {/* Quản lý Đơn hàng (Admin/Staff) */}
                        <Link
                          to="/admin/orders"
                          onClick={() => setIsDropdownOpen(false)}
                          className={`mx-2 px-3 py-2 rounded-md text-sm cursor-pointer transition-colors flex items-center gap-3 ${
                            location.pathname.startsWith("/admin/orders")
                              ? "text-mkhe-primary hover:bg-mkhe-primary/10"
                              : "opacity-80 hover:opacity-100 hover:bg-mkhe-primary/10"
                          }`}
                        >
                          <ShoppingBag className="w-4 h-4" />
                          {t("user_menu.manage_orders", { defaultValue: "Quản lý Đơn hàng" })}
                        </Link>

                        {/* Quản lý Sản phẩm (Admin/Staff) */}
                        <Link
                          to="/admin/products"
                          onClick={() => setIsDropdownOpen(false)}
                          className={`mx-2 px-3 py-2 rounded-md text-sm cursor-pointer transition-colors flex items-center gap-3 ${
                            location.pathname.startsWith("/admin/products")
                              ? "text-mkhe-primary hover:bg-mkhe-primary/10"
                              : "opacity-80 hover:opacity-100 hover:bg-mkhe-primary/10"
                          }`}
                        >
                          <Package className="w-4 h-4" />
                          {t("user_menu.manage_products")}
                        </Link>

                        <div className="h-px bg-mkhe-border/30 my-1.5 mx-4"></div>

                        {/* ================= CỤM 2: KHÁCH HÀNG & MARKETING ================= */}
                        {/* Quản lý Người dùng (Admin only) */}
                        {user.role === "Admin" && (
                          <Link
                            to="/admin/users"
                            onClick={() => setIsDropdownOpen(false)}
                            className={`mx-2 px-3 py-2 rounded-md text-sm cursor-pointer transition-colors flex items-center gap-3 ${
                              location.pathname.startsWith("/admin/users")
                                ? "text-mkhe-primary hover:bg-mkhe-primary/10"
                                : "opacity-80 hover:opacity-100 hover:bg-mkhe-primary/10"
                            }`}
                          >
                            <Users className="w-4 h-4" />
                            {t("user_menu.manage_users")}
                          </Link>
                        )}

                        {/* Quản lý Voucher (Admin/Staff) */}
                        <Link
                          to="/admin/vouchers"
                          onClick={() => setIsDropdownOpen(false)}
                          className={`mx-2 px-3 py-2 rounded-md text-sm cursor-pointer transition-colors flex items-center gap-3 ${
                            location.pathname.startsWith("/admin/vouchers")
                              ? "text-mkhe-primary hover:bg-mkhe-primary/10"
                              : "opacity-80 hover:opacity-100 hover:bg-mkhe-primary/10"
                          }`}
                        >
                          <Ticket className="w-4 h-4" />
                          {t("user_menu.manage_vouchers")}
                        </Link>

                        {/* Quản lý Đánh giá (Admin only) */}
                        {user.role === "Admin" && (
                          <Link
                            to="/admin/reviews"
                            onClick={() => setIsDropdownOpen(false)}
                            className={`mx-2 px-3 py-2 rounded-md text-sm cursor-pointer transition-colors flex items-center gap-3 ${
                              location.pathname.startsWith("/admin/reviews")
                                ? "text-mkhe-primary hover:bg-mkhe-primary/10"
                                : "opacity-80 hover:opacity-100 hover:bg-mkhe-primary/10"
                            }`}
                          >
                            <Star className="w-4 h-4" />
                            {t("user_menu.manage_reviews", { defaultValue: "Quản lý Đánh giá" })}
                          </Link>
                        )}

                        <div className="h-px bg-mkhe-border/30 my-1.5 mx-4"></div>

                        {/* ================= CỤM 3: NỘI DUNG & HỖ TRỢ ================= */}
                        {/* Quản lý Bài viết (Admin/Staff) */}
                        <Link
                          to="/admin/blogs"
                          onClick={() => setIsDropdownOpen(false)}
                          className={`mx-2 px-3 py-2 rounded-md text-sm cursor-pointer transition-colors flex items-center gap-3 ${
                            location.pathname.startsWith("/admin/blogs")
                              ? "text-mkhe-primary hover:bg-mkhe-primary/10"
                              : "opacity-80 hover:opacity-100 hover:bg-mkhe-primary/10"
                          }`}
                        >
                          <FileText className="w-4 h-4" />
                          {t("user_menu.manage_blogs", { defaultValue: "Quản lý Bài viết" })}
                        </Link>

                        {/* Quản lý Liên hệ (Admin/Staff) */}
                        <Link
                          to="/admin/contacts"
                          onClick={() => setIsDropdownOpen(false)}
                          className={`mx-2 px-3 py-2 rounded-md text-sm cursor-pointer transition-colors flex items-center gap-3 ${
                            location.pathname.startsWith("/admin/contacts")
                              ? "text-mkhe-primary hover:bg-mkhe-primary/10"
                              : "opacity-80 hover:opacity-100 hover:bg-mkhe-primary/10"
                          }`}
                        >
                          <Mail className="w-4 h-4" />
                          {t("user_menu.manage_contacts", { defaultValue: "Quản lý Liên hệ" })}
                        </Link>
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
                      className="w-[calc(100%-16px)] mx-2 text-left px-3 py-2 rounded-md text-sm opacity-80 text-red-500 cursor-pointer hover:opacity-100 hover:bg-red-500/10 transition-colors flex items-center gap-3"
                    >
                      <LogOut className="w-4 h-4" />
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
                          {t(lang.labelKey)}
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
          </>
        ) : (
          /* TRƯỜNG HỢP CHƯA ĐĂNG NHẬP */
          <div className="flex items-center gap-2 md:gap-3 ml-1 md:ml-2 border-l border-mkhe-border pl-2 md:pl-4">
            <div className="relative hidden md:block" ref={guestLangRef}>
              <button
                onClick={() => setIsGuestLangOpen(!isGuestLangOpen)}
                className="opacity-60 hover:opacity-100 hover:text-mkhe-primary cursor-pointer transition-colors flex items-center gap-1 text-xs font-semibold uppercase"
              >
                <Globe className="w-4 h-4" /> {currentLang.short}
              </button>

              {isGuestLangOpen && (
                <div className="absolute right-0 mt-4 w-32 bg-mkhe-input border border-mkhe-border rounded-md shadow-xl py-1 z-50 text-mkhe-text">
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
                        {t(lang.labelKey)}
                      </span>
                      {i18n.language === lang.code && (
                        <Check className="w-3 h-3 text-mkhe-primary" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setIsDark(!isDark)}
              className="hidden md:block opacity-60 hover:opacity-100 hover:text-mkhe-primary cursor-pointer transition-colors"
            >
              {isDark ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4" />
              )}
            </button>

            <Link
              to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`}
              className="text-[10px] md:text-xs uppercase tracking-wider font-semibold text-mkhe-primary border border-mkhe-primary px-2 md:px-4 py-1 md:py-1.5 rounded hover:bg-mkhe-primary hover:text-white transition-all ml-1 cursor-pointer whitespace-nowrap"
            >
              {t("guest_menu.login")}
            </Link>
          </div>
        )}
      </div>

      {/* SEARCH BAR OVERLAY */}
      {isSearchOpen && (
        <div className="absolute top-20 left-0 w-full z-[55] animate-in slide-in-from-top-2 fade-in p-4 flex justify-center pointer-events-none">
          <form ref={searchRef} onSubmit={handleSearch} className="relative w-full max-w-2xl flex items-center pointer-events-auto drop-shadow-2xl">
            <Search className="w-5 h-5 absolute left-4 text-mkhe-text/50 z-10" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Tìm kiếm sản phẩm..."
              className="w-full bg-mkhe-bg/95 backdrop-blur-md border border-mkhe-border/50 rounded-full py-3.5 pl-12 pr-12 focus:outline-none focus:border-mkhe-primary focus:ring-1 focus:ring-mkhe-primary transition-all text-sm shadow-xl text-mkhe-text placeholder-mkhe-text/50"
              autoFocus
            />
            <button 
              type="button" 
              onClick={() => setIsSearchOpen(false)}
              className="absolute right-3 text-mkhe-text/50 hover:text-mkhe-primary hover:bg-mkhe-primary/10 transition-colors cursor-pointer p-1.5 rounded-full z-10"
            >
              <X className="w-5 h-5" />
            </button>
          </form>
        </div>
      )}

      {/* MOBILE NAV MENU OVERLAY & CONTENT */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop (Darken the rest of the screen) */}
          <div 
            className="fixed inset-0 top-20 bg-black/50 backdrop-blur-sm z-[55] lg:hidden animate-in fade-in duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Menu Drawer */}
          <div className="absolute top-20 left-0 w-full bg-mkhe-bg/95 backdrop-blur-xl border-b border-mkhe-border shadow-2xl flex flex-col px-6 py-4 z-[60] lg:hidden animate-in slide-in-from-top-4 fade-in duration-300">
            {!isAdminOrStaff ? (
              navLinks.map((link) => {
                const active = isActive(link.path);
                return (
                <Link
                  key={link.key}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`py-4 border-b text-sm font-semibold transition-all duration-300 uppercase tracking-widest flex items-center justify-between group ${
                    active ? "text-mkhe-primary pl-2 border-mkhe-primary/40 bg-mkhe-primary/5" : "text-mkhe-text/80 hover:text-mkhe-primary hover:pl-2 border-mkhe-border/30"
                  }`}
                >
                  {t(`nav.${link.key}`)}
                  <ChevronRight className={`w-4 h-4 transition-all duration-300 text-mkhe-primary ${
                    active ? "opacity-100 translate-x-1" : "opacity-0 group-hover:opacity-100 group-hover:translate-x-1"
                  }`} />
                </Link>
              )})
            ) : (
              <div className="py-6 text-gradient-gold font-logo text-lg font-bold tracking-widest uppercase select-none text-center bg-mkhe-primary/5 rounded-lg border border-mkhe-primary/20">
                {isStaff ? t("user_menu.staff_area") : t("user_menu.admin_area")}
              </div>
            )}
          </div>
        </>
      )}
    </header>
  );
}
