import { useTranslation } from "react-i18next";
import LoginForm from "@/features/auth/components/LoginForm";
import authBg from "@/assets/images/bg-login.png";

export default function LoginPage() {
  const { t } = useTranslation("login");

  return (
    <div className="flex flex-1 overflow-hidden">
      <div className="hidden lg:flex lg:w-1/2 relative bg-mkhe-bg items-center justify-center border-r border-mkhe-border/30 overflow-hidden">
        <img
          src={authBg}
          alt="MKHE Heritage"
          className="absolute inset-0 w-full h-full object-cover z-0 select-none transition-transform duration-1000 hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#1A0F0A] via-[#1A0F0A]/60 to-transparent z-10" />

        <div className="absolute bottom-16 left-16 z-20 max-w-md">
          <h2 className="text-4xl font-logo text-mkhe-primary mb-4 leading-tight">
            {t("hero_quote_1")} <br />
            {t("hero_quote_2")} <br />
            {t("hero_quote_3")}
          </h2>
          <div className="w-16 h-1 bg-mkhe-primary" />
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-mkhe-bg transition-colors duration-300">
        <LoginForm />
      </div>
    </div>
  );
}
