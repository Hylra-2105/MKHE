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
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

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
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-transparent border border-mkhe-border/50 text-mkhe-text cursor-pointer focus:outline-none focus:border-mkhe-primary transition-colors flex justify-between items-center hover:border-mkhe-border ${triggerClassName}`}
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
          className={`absolute left-0 top-full mt-1 w-full bg-mkhe-input border border-mkhe-border rounded-lg shadow-xl py-2 z-50 overflow-hidden ${dropdownClassName}`}
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`w-[calc(100%-16px)] mx-2 px-3 py-2 rounded-md text-left flex justify-between items-center cursor-pointer transition-colors ${
                value === opt.value
                  ? "text-mkhe-primary hover:bg-mkhe-primary/10 font-semibold"
                  : "opacity-80 hover:opacity-100 hover:bg-mkhe-primary/10"
              } ${optionClassName}`}
            >
              <span className={`truncate ${opt.color || ""}`}>{opt.label}</span>
              {value === opt.value && <Check className="w-4 h-4 shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
