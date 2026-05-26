import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// VI
import commonVI from "./locales/vi/common.json";
import loginVI from "./locales/vi/login.json";
import registerVI from "./locales/vi/register.json";
import otpVI from "./locales/vi/otp.json";
import forgotPasswordVI from "./locales/vi/forgot_password.json";

// EN
import commonEN from "./locales/en/common.json";
import loginEN from "./locales/en/login.json";
import registerEN from "./locales/en/register.json";
import otpEN from "./locales/en/otp.json";
import forgotPasswordEN from "./locales/en/forgot_password.json";

const resources = {
  vi: {
    common: commonVI,
    login: loginVI,
    register: registerVI,
    otp: otpVI,
    forgot_password: forgotPasswordVI,
  },
  en: {
    common: commonEN,
    login: loginEN,
    register: registerEN,
    otp: otpEN,
    forgot_password: forgotPasswordEN,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "vi",
    ns: ["common", "login", "register", "otp", "forgot_password"],
    defaultNS: "common",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
