import { AlertCircle } from 'lucide-react';

export default function TextAreaField({ placeholder, value, onChange, label, required, error, rows = 4, ...props }) {
  return (
    <div className={`relative mb-4 w-full space-y-1 ${props.className || ''}`}>
      {label && (
        <label className="text-[10px] font-bold text-mkhe-text/50 uppercase ml-1 block">
          {label} {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        rows={rows}
        className={`w-full p-3.5 bg-transparent border text-mkhe-text rounded-xl focus:outline-none transition-colors text-sm placeholder:text-mkhe-text/50 custom-scrollbar resize-none ${error ? 'border-red-500' : 'border-mkhe-border/50 focus:border-mkhe-primary'}`}
        {...props}
      ></textarea>
      {error && (
        <div className="flex items-center gap-1.5 mt-1.5 ml-1 text-red-500">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p className="text-xs font-medium">{error}</p>
        </div>
      )}
    </div>
  );
}
