import { forwardRef } from 'react';
import { cn } from '@/utils/cn';

const CheckboxField = forwardRef(({ label, checked, onChange, name, className, ...props }, ref) => {
  return (
    <div className={cn("inline-flex items-center", className)}>
      <input
        type="checkbox"
        id={name}
        name={name}
        className="magic-cb-input"
        checked={checked}
        onChange={onChange}
        ref={ref}
        {...props}
      />
      <label htmlFor={name} className="magic-cb-label text-sm">
        <span></span> {label}
      </label>
    </div>
  );
});

CheckboxField.displayName = "CheckboxField";

export default CheckboxField;
