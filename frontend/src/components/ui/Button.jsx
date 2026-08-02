export default function Button({
  children,
  onClick,
  type = "button",
  className = "",
  disabled = false,
  form,
  variant = "primary", // primary, outline, ghost, danger
  size = "md", // sm, md, lg, icon
  isLoading = false,
  ...rest
}) {
  // Base classes for all buttons
  const baseClasses = "cursor-pointer flex items-center justify-center gap-2 font-bold tracking-wide uppercase transition-all duration-300 transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed";
  
  // Size classes
  const sizeClasses = {
    sm: "py-2 px-4 text-xs rounded-lg",
    md: "py-3 px-6 text-sm rounded-xl",
    lg: "py-4 px-8 text-base rounded-xl",
    icon: "p-2 rounded-xl", // For icon-only buttons
  };

  // Variant classes
  const variantClasses = {
    primary: "bg-gradient-gold text-[#1A0F0A] hover:opacity-90 shadow-lg shadow-amber-500/20",
    outline: "bg-transparent border-2 border-mkhe-border text-mkhe-text hover:border-mkhe-primary hover:text-mkhe-primary",
    ghost: "bg-transparent text-mkhe-text/60 hover:text-mkhe-primary hover:bg-mkhe-primary/10",
    danger: "bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-500/20",
    link: "bg-transparent text-mkhe-primary hover:underline p-0 h-auto font-bold",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      form={form}
      {...rest}
      className={`
        ${baseClasses}
        ${sizeClasses[size] || sizeClasses.md}
        ${variantClasses[variant] || variantClasses.primary}
        ${className}
      `}
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-current/20 border-t-current rounded-full animate-spin"></div>
      ) : null}
      {children}
    </button>
  );
}
