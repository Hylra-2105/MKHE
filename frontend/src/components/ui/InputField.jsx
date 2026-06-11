export default function InputField({ type, placeholder, value, onChange, rightElement, ...props }) {
  return (
    <div className="relative mb-4 w-full">
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full p-3 bg-mkhe-input text-mkhe-text border border-mkhe-border rounded outline-none focus:border-mkhe-primary transition-colors placeholder:text-mkhe-text/50 ${rightElement ? "pr-10" : ""}`}
        {...props}
      />
      {rightElement && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center text-mkhe-text/50 hover:text-mkhe-primary transition-colors z-10">
          {rightElement}
        </div>
      )}
    </div>
  );
}
