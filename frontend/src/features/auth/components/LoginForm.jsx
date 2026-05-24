import { useState } from "react";
import { useTranslation } from "react-i18next";
import InputField from "@/components/ui/InputField";
import Button from "@/components/ui/Button";
import GoogleIcon from "@/components/ui/icons/GoogleIcon";
import FacebookIcon from "@/components/ui/icons/FacebookIcon";

export default function LoginForm() {
  const { t } = useTranslation("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <form className="w-full max-w-[360px] mx-auto">
      <h1 className="text-3xl font-logo font-bold mb-2 text-mkhe-primary">
        {t("title")}
      </h1>
      <p className="text-mkhe-text/60 mb-8 text-sm italic">{t("slogan")}</p>

      <InputField
        type="email"
        placeholder={t("email_placeholder")}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <InputField
        type="password"
        placeholder={t("password_placeholder")}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <div className="flex justify-end mb-6">
        <a
          href="#"
          className="text-sm text-mkhe-primary hover:underline transition-all"
        >
          {t("forgot_password")}
        </a>
      </div>

      <Button type="submit">{t("submit_btn")}</Button>

      <div className="flex items-center my-6">
        <div className="flex-1 border-t border-mkhe-border/50"></div>
        <span className="px-4 text-xs text-mkhe-text/50 uppercase tracking-wider">
          {t("or_continue_with")}
        </span>
        <div className="flex-1 border-t border-mkhe-border/50"></div>
      </div>

      <div className="flex gap-4 mb-6">
        <button
          type="button"
          className="flex-1 flex items-center justify-center cursor-pointer gap-2 py-2.5 border border-mkhe-border/50 rounded hover:bg-mkhe-primary/10 transition-colors duration-300"
        >
          <GoogleIcon />
          <span className="text-sm font-semibold text-mkhe-text">
            {t("google")}
          </span>
        </button>

        <button
          type="button"
          className="flex-1 flex items-center justify-center cursor-pointer gap-2 py-2.5 border border-mkhe-border/50 rounded hover:bg-mkhe-primary/10 transition-colors duration-300"
        >
          <FacebookIcon />
          <span className="text-sm font-semibold text-mkhe-text">
            {t("facebook")}
          </span>
        </button>
      </div>

      <div className="text-center text-sm mt-4">
        <span className="text-mkhe-text/60">{t("no_account")} </span>
        <a
          href="/register"
          className="text-mkhe-primary font-bold hover:underline ml-1"
        >
          {t("register_now")}
        </a>
      </div>
    </form>
  );
}
