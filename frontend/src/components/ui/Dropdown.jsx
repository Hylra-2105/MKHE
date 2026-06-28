import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

const Dropdown = ({
  value,
  options,
  onChange,
  placeholder,
  className = "",
  triggerClassName = "",
  dropdownClassName = "",
  optionClassName = "",
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);
  const selectedLabel = selectedOption ? selectedOption.label : placeholder;
  const selectedColor = selectedOption?.color || "";

  return (
    <div
      className={`relative ${className}`}
      ref={dropdownRef}
      style={{ zIndex: isOpen ? 50 : "auto" }}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
            if (!isOpen) {
              setTimeout(() => {
                menuRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
              }, 100);
            }
          }
        }}
        className={`w-full bg-transparent border border-mkhe-border/50 text-mkhe-text focus:outline-none focus:border-mkhe-primary transition-colors flex justify-between items-center hover:border-mkhe-border ${disabled ? "opacity-60 bg-gray-100 cursor-not-allowed" : "cursor-pointer"} ${triggerClassName}`}
      >
        <span className={`truncate ${selectedColor}`}>{selectedLabel}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-300 shrink-0 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className={`absolute left-0 top-full mt-1 w-full bg-mkhe-input border border-mkhe-border rounded-lg shadow-xl py-2 z-50 max-h-60 overflow-y-auto custom-scrollbar ${dropdownClassName}`}
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              disabled={opt.disabled}
              onClick={() => {
                if (!opt.disabled) {
                  onChange(opt.value);
                  setIsOpen(false);
                }
              }}
              className={`w-[calc(100%-16px)] mx-2 px-3 py-2 rounded-md text-left flex justify-between items-center transition-colors ${
                opt.disabled
                  ? "opacity-40 cursor-not-allowed bg-mkhe-border/5 text-mkhe-text/50"
                  : value === opt.value
                  ? "text-mkhe-primary hover:bg-mkhe-primary/10 font-semibold cursor-pointer"
                  : "opacity-80 hover:opacity-100 hover:bg-mkhe-primary/10 cursor-pointer"
              } ${optionClassName}`}
            >
              <span className={`truncate ${opt.color || ""}`}>{opt.label}</span>
              {value === opt.value && !opt.disabled && <Check className="w-4 h-4 shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
