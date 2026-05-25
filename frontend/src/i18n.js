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

import otpVI from "./locales/vi/otp.json";
import otpEN from "./locales/en/otp.json";

const resources = {
  vi: {
    common: commonVI,
    login: loginVI,
    register: registerVI,
    otp: otpVI,
  },
  en: {
    common: commonEN,
    login: loginEN,
    register: registerEN,
    otp: otpEN,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "vi",
    ns: ["common", "login", "register", "otp"], 
    defaultNS: "common",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
