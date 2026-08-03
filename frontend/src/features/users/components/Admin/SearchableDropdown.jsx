import { useState, useEffect, useRef } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/utils/cn";

const SearchableDropdown = ({
  name,
  value,
  onChange,
  options,
  placeholder,
  disabled,
  error,
  t,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
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

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          "w-full p-2 bg-[var(--color-mkhe-bg)] border rounded min-h-[32px] flex items-center justify-between transition-colors text-sm",
          disabled ? "bg-[var(--color-mkhe-border)]/30 cursor-not-allowed opacity-60" : "cursor-pointer",
          error
            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
            : "border-[var(--color-mkhe-primary)]/50 focus:border-[var(--color-mkhe-primary)] focus:ring-2 focus:ring-[var(--color-mkhe-primary)]/20 hover:border-[var(--color-mkhe-primary)]"
        )}
      >
        <span className={cn("truncate", !value && "text-[var(--color-mkhe-text)]/50")}>
          {value || placeholder}
        </span>
        <ChevronDown
          className={cn(
            "w-4 h-4 transition-transform duration-300 shrink-0 text-[var(--color-mkhe-text)]/50",
            isOpen && "rotate-180"
          )}
        />
      </div>

      {isOpen && (
        <div className="absolute z-[150] top-full left-0 w-full mt-1 bg-[var(--color-mkhe-input)] border border-[var(--color-mkhe-border)]/50 rounded-xl shadow-xl flex flex-col overflow-hidden transition-colors">
          <div className="p-2 border-b border-[var(--color-mkhe-border)]/20 bg-[var(--color-mkhe-bg)]/50">
            <input
              type="text"
              className="w-full p-1.5 border border-[var(--color-mkhe-border)]/50 rounded text-sm focus:outline-none focus:border-[var(--color-mkhe-primary)] bg-[var(--color-mkhe-bg)] text-[var(--color-mkhe-text)] transition-colors"
              placeholder={t("common.search_placeholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
          <ul className="overflow-y-auto custom-scrollbar max-h-48">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <li
                  key={opt}
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange({ target: { name, value: opt } });
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                  className={cn(
                    "w-[calc(100%-16px)] mx-2 mb-1 px-3 py-2 rounded-lg text-left flex justify-between items-center transition-colors text-sm cursor-pointer",
                    value === opt
                      ? "font-semibold text-[var(--color-mkhe-primary)] hover:bg-[var(--color-mkhe-primary)]/10"
                      : "text-[var(--color-mkhe-text)] hover:bg-[var(--color-mkhe-primary)]/10"
                  )}
                >
                  <span className="truncate">{opt}</span>
                  {value === opt && <Check className="w-4 h-4 shrink-0 text-[var(--color-mkhe-primary)]" />}
                </li>
              ))
            ) : (
              <li className="p-3 text-sm text-[var(--color-mkhe-text)]/40 text-center italic">
                {t("common.no_results")}
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchableDropdown;
