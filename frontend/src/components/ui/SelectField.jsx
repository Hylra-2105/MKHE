import { forwardRef } from 'react';
import { AlertCircle, ChevronDown } from 'lucide-react';
import { cn } from '@/utils/cn';

import Dropdown from './Dropdown';

const SelectField = forwardRef(({ label, required, error, className, options, placeholder, value, onChange, disabled, ...props }, ref) => {
  return (
    <div className={cn("relative mb-4 w-full space-y-1", className)}>
      {label && (
        <label className="text-[10px] font-bold text-mkhe-text/50 uppercase ml-1 block">
          {label} {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}
      <Dropdown
        value={value}
        onChange={(val) => {
          if (onChange) {
            // Simulate event object for Dropdown onChange if needed by parents
            onChange({ target: { value: val, name: props.name } });
          }
        }}
        options={options || []}
        placeholder={placeholder}
        disabled={disabled}
        error={!!error}
      />
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
