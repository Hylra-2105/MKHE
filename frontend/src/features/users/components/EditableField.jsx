import React from "react";
import SearchableDropdown from "./SearchableDropdown";

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
}) => {
  // Xử lý thông minh khi chế độ Đọc: Nếu SDT chưa có +84 thì tự nối vào cho đẹp
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
            className="w-full p-2 bg-white border border-mkhe-primary/50 rounded focus:outline-none focus:ring-2 focus:ring-mkhe-primary/20 text-sm"
            rows="2"
          />
        ) : (
          <div className="flex shadow-sm rounded">
            {prefix && (
              <span className="inline-flex items-center px-3 rounded-l border border-r-0 border-mkhe-primary/50 bg-gray-100 text-gray-500 sm:text-sm font-semibold h-8">
                {prefix}
              </span>
            )}
            <input
              type="text"
              name={name}
              value={value}
              onChange={onChange}
              disabled={disabled}
              className={`w-full p-2 bg-white border border-mkhe-primary/50 h-8 focus:outline-none focus:ring-2 focus:ring-mkhe-primary/20 text-sm ${prefix ? "rounded-r" : "rounded"}`}
            />
          </div>
        )
      ) : (
        <p
          className={`text-mkhe-text font-medium border-b border-mkhe-border/10 pb-1 min-h-[32px] flex items-end ${!value ? "italic text-mkhe-text/50" : ""}`}
        >
          {displayValue || placeholder}
        </p>
      )}
    </div>
  );
};

export default EditableField;
