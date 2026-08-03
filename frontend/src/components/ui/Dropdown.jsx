import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/utils/cn";

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
  error = false,
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
        className={cn(
          "w-full bg-transparent border rounded-xl p-3.5 min-h-[32px] flex items-center justify-between transition-colors text-sm text-[var(--color-mkhe-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-mkhe-primary)]/20",
          disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:border-[var(--color-mkhe-primary)] bg-[var(--color-mkhe-bg)]",
          error
            ? "border-red-500 focus:border-red-500"
            : isOpen ? "border-[var(--color-mkhe-primary)]" : "border-[var(--color-mkhe-border)]/50 focus:border-[var(--color-mkhe-primary)]",
          triggerClassName
        )}
      >
        <span className={cn("truncate", !value && "text-[var(--color-mkhe-text)]/50", selectedColor)}>{selectedLabel}</span>
        <ChevronDown
          className={cn(
            "w-4 h-4 transition-transform duration-300 shrink-0 text-[var(--color-mkhe-text)]/50",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className={cn(
            "absolute left-0 top-full mt-1 w-full bg-[var(--color-mkhe-input)] border border-[var(--color-mkhe-border)]/50 rounded-xl shadow-xl py-2 z-50 max-h-60 overflow-y-auto custom-scrollbar",
            dropdownClassName
          )}
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
              className={cn(
                "w-[calc(100%-16px)] mx-2 px-3 py-2 rounded-lg text-left flex justify-between items-center transition-colors text-sm",
                opt.disabled
                  ? "opacity-40 cursor-not-allowed bg-[var(--color-mkhe-border)]/10 text-[var(--color-mkhe-text)]/50"
                  : value === opt.value
                  ? "font-semibold text-[var(--color-mkhe-primary)] hover:bg-[var(--color-mkhe-primary)]/10 cursor-pointer"
                  : "text-[var(--color-mkhe-text)] hover:bg-[var(--color-mkhe-primary)]/10 cursor-pointer",
                optionClassName
              )}
            >
              <span className={cn("truncate", opt.color || "")}>{opt.label}</span>
              {value === opt.value && !opt.disabled && <Check className="w-4 h-4 shrink-0 text-[var(--color-mkhe-primary)]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
