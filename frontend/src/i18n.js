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
import homeVI from "./locales/vi/home.json";
import commonVI from "./locales/vi/common.json";
import dppVI from "./locales/vi/dpp.json";

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
import homeEN from "./locales/en/home.json";
import commonEN from "./locales/en/common.json";
import dppEN from "./locales/en/dpp.json";

// ZH

import loginZH from "./locales/zh/login.json";
import registerZH from "./locales/zh/register.json";
import otpZH from "./locales/zh/otp.json";
import forgotPasswordZH from "./locales/zh/forgot_password.json";
import headerZH from "./locales/zh/header.json";
import adminZH from "./locales/zh/admin.json";
import errorsZH from "./locales/zh/errors.json";
import userZH from "./locales/zh/user.json";
import productZH from "./locales/zh/product.json";
import homeZH from "./locales/zh/home.json";
import commonZH from "./locales/zh/common.json";
import dppZH from "./locales/zh/dpp.json";

// KO

import loginKO from "./locales/ko/login.json";
import registerKO from "./locales/ko/register.json";
import otpKO from "./locales/ko/otp.json";
import forgotPasswordKO from "./locales/ko/forgot_password.json";
import headerKO from "./locales/ko/header.json";
import adminKO from "./locales/ko/admin.json";
import errorsKO from "./locales/ko/errors.json";
import userKO from "./locales/ko/user.json";
import productKO from "./locales/ko/product.json";
import homeKO from "./locales/ko/home.json";
import commonKO from "./locales/ko/common.json";
import dppKO from "./locales/ko/dpp.json";

// JA

import loginJA from "./locales/ja/login.json";
import registerJA from "./locales/ja/register.json";
import otpJA from "./locales/ja/otp.json";
import forgotPasswordJA from "./locales/ja/forgot_password.json";
import headerJA from "./locales/ja/header.json";
import adminJA from "./locales/ja/admin.json";
import errorsJA from "./locales/ja/errors.json";
import userJA from "./locales/ja/user.json";
import productJA from "./locales/ja/product.json";
import homeJA from "./locales/ja/home.json";
import commonJA from "./locales/ja/common.json";
import dppJA from "./locales/ja/dpp.json";


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
    home: homeVI,
    common: commonVI,
    dpp: dppVI,
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
    home: homeEN,
    common: commonEN,
    dpp: dppEN,
  },
  zh: {
    login: loginZH,
    register: registerZH,
    otp: otpZH,
    forgot_password: forgotPasswordZH,
    header: headerZH,
    admin: adminZH,
    errors: errorsZH,
    user: userZH,
    product: productZH,
    home: homeZH,
    common: commonZH,
    dpp: dppZH,
  },
  ko: {
    login: loginKO,
    register: registerKO,
    otp: otpKO,
    forgot_password: forgotPasswordKO,
    header: headerKO,
    admin: adminKO,
    errors: errorsKO,
    user: userKO,
    product: productKO,
    home: homeKO,
    common: commonKO,
    dpp: dppKO,
  },
  ja: {
    login: loginJA,
    register: registerJA,
    otp: otpJA,
    forgot_password: forgotPasswordJA,
    header: headerJA,
    admin: adminJA,
    errors: errorsJA,
    user: userJA,
    product: productJA,
    home: homeJA,
    common: commonJA,
    dpp: dppJA,
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
      "home",
      "common",
      "dpp",
    ],
    defaultNS: "user",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
