import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Import các file JSON
import commonVI from "./locales/vi/common.json";
import loginVI from "./locales/vi/login.json";

import commonEN from "./locales/en/common.json";
import loginEN from "./locales/en/login.json";

import registerVI from "./locales/vi/register.json";
import registerEN from "./locales/en/register.json";

const resources = {
  vi: {
    common: commonVI,
    login: loginVI,
    register: registerVI,
  },
  en: {
    common: commonEN,
    login: loginEN,
    register: registerEN,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "vi", // Mặc định luôn là Tiếng Việt
    ns: ["common", "login", "register"], // Liệt kê các namespaces đang có
    defaultNS: "common", // Namespace mặc định nếu không gọi tên cụ thể
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
