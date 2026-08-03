import { forwardRef } from 'react';
import { AlertCircle, ChevronDown } from 'lucide-react';
import { cn } from '@/utils/cn';

const SelectField = forwardRef(({ label, required, error, className, options, placeholder, value, onChange, ...props }, ref) => {
  return (
    <div className={cn("relative mb-4 w-full space-y-1", className)}>
      {label && (
        <label className="text-[10px] font-bold text-mkhe-text/50 uppercase ml-1 block">
          {label} {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          value={value}
          onChange={onChange}
          required={required}
          className={cn(
            "w-full p-3.5 bg-transparent border text-mkhe-text rounded-xl focus:outline-none transition-colors text-sm appearance-none",
            error ? "border-red-500" : "border-mkhe-border/50 focus:border-mkhe-primary",
            "cursor-pointer"
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled className="text-mkhe-text/50 bg-mkhe-bg">
              {placeholder}
            </option>
          )}
          {options?.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-mkhe-bg text-mkhe-text">
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-mkhe-text/50">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
      {error && (
        <div className="flex items-center gap-1.5 mt-1.5 ml-1 text-red-500">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p className="text-xs font-medium">{error}</p>
        </div>
      )}
    </div>
  );
});

SelectField.displayName = "SelectField";

export default SelectField;
