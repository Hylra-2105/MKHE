import { useTranslation } from "react-i18next";
import RegisterForm from "@/features/auth/components/RegisterForm";

import authBgDark from "@/assets/images/bg-login-dark-1.png";
import authBgLight from "@/assets/images/bg-login-light-1.png";

export default function RegisterPage() {
  const { t } = useTranslation("register");

  return (
    <div className="flex flex-1 overflow-hidden">
      <div className="hidden lg:flex lg:w-1/2 relative bg-mkhe-bg items-center justify-center border-r border-mkhe-border/30 overflow-hidden">
        <img
          src={authBgDark}
          alt="MKHE Heritage Dark"
          data-theme="dark"
          className="absolute inset-0 w-full h-full object-cover z-0 select-none transition-transform duration-1000 hover:scale-105"
        />

        <img
          src={authBgLight}
          alt="MKHE Heritage Light"
          data-theme="light"
          className="absolute inset-0 w-full h-full object-cover z-0 select-none transition-transform duration-1000 hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-mkhe-bg via-mkhe-bg/60 to-transparent z-10 transition-colors duration-500" />

        <div className="absolute bottom-16 left-16 z-20 max-w-md">
          <h2 className="text-4xl font-logo text-mkhe-primary mb-4 leading-tight transition-colors duration-500">
            {t("hero_quote_1")} <br />
            {t("hero_quote_2")} <br />
            {t("hero_quote_3")}
          </h2>
          <div className="w-16 h-1 bg-mkhe-primary transition-colors duration-500" />
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-mkhe-bg transition-colors duration-300">
        <RegisterForm />
      </div>
    </div>
  );
}
