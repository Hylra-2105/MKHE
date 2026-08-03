import SearchableDropdown from "@/features/users/components/Admin/SearchableDropdown";
import { AlertCircle } from "lucide-react";
import InputField from "@/components/ui/InputField";
import TextAreaField from "@/components/ui/TextAreaField";

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
  const isDisabled = !isEditing || disabled;

  return (
    <div className="w-full">
      {options ? (
        <div className="mb-4">
          <label className="text-[10px] uppercase font-bold text-mkhe-text/50 ml-1 block mb-1">
            {label}
          </label>
          <SearchableDropdown
            name={name}
            value={value}
            onChange={onChange}
            options={options}
            placeholder={placeholder}
            disabled={isDisabled}
            error={isEditing ? error : null}
            t={t}
          />
          {error && isEditing && (
            <div className="flex items-center gap-1.5 mt-1.5 ml-1 text-red-500">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p className="text-xs font-medium">{error}</p>
            </div>
          )}
        </div>
      ) : isTextArea ? (
        <TextAreaField
          name={name}
          value={value}
          onChange={onChange}
          disabled={isDisabled}
          placeholder={placeholder}
          label={label}
          error={isEditing ? error : null}
          rows={2}
          className="disabled:opacity-70"
          wrapperClassName="!mb-0"
        />
      ) : (
        <InputField
          name={name}
          value={value}
          onChange={onChange}
          disabled={isDisabled}
          placeholder={placeholder}
          label={label}
          error={isEditing ? error : null}
          leftElement={prefix ? (
            <span className="inline-flex items-center px-3 border-r border-mkhe-border/50 bg-mkhe-border/10 text-mkhe-text/60 sm:text-sm font-semibold h-full transition-colors rounded-l-xl">
              {prefix}
            </span>
          ) : null}
          className={prefix ? "!pl-14 disabled:opacity-70" : "disabled:opacity-70"}
          wrapperClassName="!mb-0"
        />
      )}
    </div>
  );
};

export default EditableField;
