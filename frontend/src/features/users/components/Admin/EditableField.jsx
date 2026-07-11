import SearchableDropdown from "@/features/users/components/Admin/SearchableDropdown";
import { AlertCircle } from "lucide-react";

const EditableField = ({
  label,
  name,
  value,
  isEditing,
  onChange,
  placeholder,
  isTextArea,
  options,
  disabled,
  t,
  prefix,
  error,
}) => {
  const displayValue =
    prefix && value && !value.startsWith(prefix) ? `${prefix} ${value}` : value;

  return (
    <div>
      <label className="text-[10px] uppercase font-bold text-mkhe-text/40 block mb-1">
        {label}
      </label>
      {isEditing ? (
        options ? (
          <SearchableDropdown
            name={name}
            value={value}
            onChange={onChange}
            options={options}
            placeholder={placeholder}
            disabled={disabled}
            t={t}
          />
        ) : isTextArea ? (
          <textarea
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            placeholder={placeholder}
            className="w-full p-2 bg-[var(--color-mkhe-bg)] text-[var(--color-mkhe-text)] border border-[var(--color-mkhe-primary)]/50 rounded focus:outline-none focus:ring-2 focus:ring-[var(--color-mkhe-primary)]/20 text-sm transition-colors"
            rows="2"
          />
        ) : (
          <div className="flex shadow-sm rounded transition-colors">
            {prefix && (
              <span className="inline-flex items-center px-3 rounded-l border border-r-0 border-[var(--color-mkhe-primary)]/50 bg-[var(--color-mkhe-border)]/30 text-[var(--color-mkhe-text)]/60 sm:text-sm font-semibold h-8 transition-colors">
                {prefix}
              </span>
            )}
            <input
              type="text"
              name={name}
              value={value}
              onChange={onChange}
              disabled={disabled}
              placeholder={placeholder}
              className={`w-full p-2 bg-[var(--color-mkhe-bg)] text-[var(--color-mkhe-text)] border ${error ? "border-red-500" : "border-[var(--color-mkhe-primary)]/50"} h-8 focus:outline-none focus:ring-2 ${error ? "focus:ring-red-500/20" : "focus:ring-[var(--color-mkhe-primary)]/20"} text-sm transition-colors ${prefix ? "rounded-r" : "rounded"}`}
            />
          </div>
        )
      ) : (
        <p
          className={`text-mkhe-text font-medium border-b border-mkhe-border/90 pb-1 min-h-[32px] flex items-end ${!value ? "italic text-mkhe-text/50" : ""}`}
        >
          {displayValue || placeholder}
        </p>
      )}
      {error && isEditing && (
        <div className="flex items-center gap-1.5 mt-1.5 ml-1 text-red-500">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p className="text-xs font-medium">{error}</p>
        </div>
      )}
    </div>
  );
};

export default EditableField;
