import { AlertCircle } from 'lucide-react';

export default function TextAreaField({ placeholder, value, onChange, label, required, error, ...props }) {
  return (
    <div className="relative mb-4 w-full">
      {label && (
        <label className="block text-sm mb-1.5 text-mkhe-text/80 font-medium">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className={`w-full p-3 bg-mkhe-input text-mkhe-text border ${error ? 'border-red-500 focus:border-red-500' : 'border-mkhe-border focus:border-mkhe-primary'} rounded outline-none transition-colors placeholder:text-mkhe-text/50 resize-y min-h-[120px]`}
        {...props}
      ></textarea>
      {error && (
        <div className="text-red-500 text-xs mt-1.5 flex items-start gap-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
