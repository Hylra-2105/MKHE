import { AlertCircle } from 'lucide-react';

export default function InputField({ type, placeholder, value, onChange, rightElement, label, required, error, ...props }) {
  return (
    <div className="relative mb-4 w-full space-y-1">
      {label && (
        <label className="text-[10px] font-bold text-mkhe-text/50 uppercase ml-1 block">
          {label} {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`w-full p-3.5 bg-transparent border text-mkhe-text rounded-xl focus:outline-none transition-colors text-sm placeholder:text-mkhe-text/50 ${error ? 'border-red-500' : 'border-mkhe-border/50 focus:border-mkhe-primary'} ${rightElement ? "pr-10" : ""}`}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center text-mkhe-text/50 hover:text-mkhe-primary transition-colors z-10">
            {rightElement}
          </div>
        )}
      </div>
      {error && (
        <div className="flex items-center gap-1.5 mt-1.5 ml-1 text-red-500">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p className="text-xs font-medium">{error}</p>
        </div>
      )}
    </div>
  );
}
