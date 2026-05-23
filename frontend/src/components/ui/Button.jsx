export default function Button({
  children,
  onClick,
  type = "button",
  className = "",
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`
        w-full py-3 px-6 rounded-md
        font-bold text-[#1A0F0A] tracking-wide uppercase
        bg-gradient-to-r from-[#E5C78B] via-[#C5A059] to-[#9C7935]
        hover:from-[#C5A059] hover:via-[#9C7935] hover:to-[#7A5C22]
        cursor-pointer
        transition-all duration-300 transform
        flex items-center justify-center gap-2
        ${className}
      `}
    >
      {children}
    </button>
  );
}
