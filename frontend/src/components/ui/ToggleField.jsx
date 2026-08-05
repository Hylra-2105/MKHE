import { forwardRef } from 'react';
import { cn } from '@/utils/cn';

const ToggleField = forwardRef(({ label, checked, onChange, name, className, ...props }, ref) => {
  return (
    <div className={cn("flex items-center", className)}>
      <label htmlFor={name} className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          id={name}
          name={name}
          checked={checked}
          onChange={onChange}
          className="sr-only peer"
          ref={ref}
          {...props}
        />
        <div className="relative w-11 h-6 bg-mkhe-border/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-mkhe-primary shrink-0"></div>
        {label && <span className="ml-3 text-sm font-medium text-mkhe-text">{label}</span>}
      </label>
    </div>
  );
});

ToggleField.displayName = "ToggleField";

export default ToggleField;
