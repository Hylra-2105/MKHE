import { AlertCircle } from 'lucide-react';

export default function InputField({ type, placeholder, value, onChange, rightElement, label, required, error, ...props }) {
  return (
    <div className="relative mb-4 w-full">
      {label && (
        <label className="block text-sm mb-1.5 text-mkhe-text/80 font-medium">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          className={`w-full p-3 bg-mkhe-input text-mkhe-text border ${error ? 'border-red-500 focus:border-red-500' : 'border-mkhe-border focus:border-mkhe-primary'} rounded outline-none transition-colors placeholder:text-mkhe-text/50 ${rightElement ? "pr-10" : ""}`}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center text-mkhe-text/50 hover:text-mkhe-primary transition-colors z-10">
            {rightElement}
          </div>
        )}
      </div>
      {error && (
        <div className="text-red-500 text-xs mt-1.5 flex items-start gap-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
