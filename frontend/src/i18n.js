import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// VI

import loginVI from "./locales/vi/login.json";
import registerVI from "./locales/vi/register.json";
import otpVI from "./locales/vi/otp.json";
import forgotPasswordVI from "./locales/vi/forgot_password.json";
import headerVI from "./locales/vi/header.json";
import adminVI from "./locales/vi/admin.json";
import errorsVI from "./locales/vi/errors.json";
import userVI from "./locales/vi/user.json";
import productVI from "./locales/vi/product.json";

// EN

import loginEN from "./locales/en/login.json";
import registerEN from "./locales/en/register.json";
import otpEN from "./locales/en/otp.json";
import forgotPasswordEN from "./locales/en/forgot_password.json";
import headerEN from "./locales/en/header.json";
import adminEN from "./locales/en/admin.json";
import errorsEN from "./locales/en/errors.json";
import userEN from "./locales/en/user.json";
import productEN from "./locales/en/product.json";

const resources = {
  vi: {
    login: loginVI,
    register: registerVI,
    otp: otpVI,
    forgot_password: forgotPasswordVI,
    header: headerVI,
    admin: adminVI,
    errors: errorsVI,
    user: userVI,
    product: productVI,
  },
  en: {
    login: loginEN,
    register: registerEN,
    otp: otpEN,
    forgot_password: forgotPasswordEN,
    header: headerEN,
    admin: adminEN,
    errors: errorsEN,
    user: userEN,
    product: productEN,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "vi",
    ns: [
      "login",
      "register",
      "otp",
      "forgot_password",
      "header",
      "admin",
      "errors",
      "user",
      "product",
    ],
    defaultNS: "user",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
