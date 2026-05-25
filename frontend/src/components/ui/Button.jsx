export default function Button({
  children,
  onClick,
  type = "button",
  className = "",
  disabled = false, // Bổ sung prop disabled để xử lý lúc đang load API
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full py-3 px-6 rounded-md
        font-bold text-[#1A0F0A] tracking-wide uppercase
        bg-gradient-gold
        cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed
        transition-all duration-300 transform active:scale-[0.98]
        flex items-center justify-center gap-2
        ${className}
      `}
    >
      {children}
    </button>
  );
}
