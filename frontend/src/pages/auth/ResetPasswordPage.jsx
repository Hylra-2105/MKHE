import ResetPasswordForm from "@/features/auth/components/ResetPasswordForm";
import authBgDark from "@/assets/images/bg-otp-dark-1.png";
import authBgLight from "@/assets/images/bg-otp-light-1.png";

export default function ResetPasswordPage() {
  return (
    <div className="flex-1 relative flex items-center justify-center p-4 overflow-hidden w-full h-full">
      <img
        src={authBgDark}
        alt="MKHE Reset Dark"
        data-theme="dark"
        className="absolute inset-0 w-full h-full object-cover z-0 select-none transition-transform duration-1000"
      />

      <img
        src={authBgLight}
        alt="MKHE Reset Light"
        data-theme="light"
        className="absolute inset-0 w-full h-full object-cover z-0 select-none transition-transform duration-1000"
      />

      <div className="absolute inset-0 theme-overlay z-10 transition-colors duration-500" />

      {/* Khung Form */}
      <div className="relative z-20 w-full max-w-md p-8 bg-mkhe-input/40 backdrop-blur-xl border border-mkhe-primary/80 rounded-2xl theme-shadow">
        <div className="absolute top-6 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-mkhe-primary/70 to-transparent mx-8"></div>
        <div className="absolute bottom-6 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-mkhe-primary/70 to-transparent mx-8"></div>

        <div className="relative z-30 pt-4 pb-2">
          <ResetPasswordForm />
        </div>
      </div>
    </div>
  );
}
