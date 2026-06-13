import { useTranslation } from "react-i18next";
import { useState, useEffect, useRef } from "react";
import logo from "@/assets/images/logo-mkhe.png";
import { Globe, Moon, Sun, Check, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { applyTheme } from "@/utils/theme";

const LANGUAGES = [
  { code: "vi", labelKey: "languages.vi", short: "VI" },
  { code: "en", labelKey: "languages.en", short: "EN" },
  { code: "zh", labelKey: "languages.zh", short: "ZH" },
  { code: "ko", labelKey: "languages.ko", short: "KO" },
  { code: "ja", labelKey: "languages.ja", short: "JA" },
];

export default function AuthHeader() {
  const { t, i18n } = useTranslation("header");

  const [isDark, setIsDark] = useState(() => {
    const theme = localStorage.getItem("theme");
    if (theme === "dark") {
      return true;
    } else if (theme === "light") {
      return false;
    }
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

  const [isLangOpen, setIsLangOpen] = useState(false);
  const langRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (langRef.current && !langRef.current.contains(event.target)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
        <div className="relative" ref={langRef}>
          <button
            onClick={() => setIsLangOpen(!isLangOpen)}
            className="flex items-center gap-1.5 opacity-80 cursor-pointer hover:text-mkhe-primary hover:opacity-100 transition-colors font-semibold text-sm uppercase"
          >
            <Globe className="w-5 h-5" /> 
            {LANGUAGES.find((l) => l.code === i18n.language)?.short || "VI"}
            <ChevronDown className="w-4 h-4 ml-0.5" />
          </button>

          {isLangOpen && (
            <div className="absolute right-0 top-full mt-2 w-40 bg-mkhe-input border border-mkhe-primary/20 rounded-md shadow-xl py-2 z-50 text-mkhe-text">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    i18n.changeLanguage(lang.code);
                    setIsLangOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm flex items-center justify-between cursor-pointer hover:bg-mkhe-primary/10 transition-colors"
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

        <button
          onClick={() => setIsDark(!isDark)}
          className="opacity-80 hover:text-mkhe-primary cursor-pointer hover:opacity-100 transition-colors"
        >
          {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>
      </div>
    </header>
  );
}
