import React, { useState, useEffect, useRef } from "react";

const SearchableDropdown = ({
  name,
  value,
  onChange,
  options,
  placeholder,
  disabled,
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
        className={`w-full p-2 bg-[var(--color-mkhe-bg)] border border-[var(--color-mkhe-primary)]/50 rounded min-h-[32px] flex items-center justify-between cursor-pointer focus:ring-2 focus:ring-[var(--color-mkhe-primary)]/20 text-sm transition-colors ${
          disabled
            ? "bg-[var(--color-mkhe-border)]/30 cursor-not-allowed opacity-60"
            : "hover:border-[var(--color-mkhe-primary)]"
        }`}
      >
        <span
          className={
            value
              ? "text-[var(--color-mkhe-text)]"
              : "text-[var(--color-mkhe-text)]/40"
          }
        >
          {value || placeholder}
        </span>
        <span className="text-[var(--color-mkhe-text)]/40 text-[10px] ml-2">
          ▼
        </span>
      </div>

      {isOpen && (
        <div className="absolute z-[150] top-full left-0 w-full mt-1 bg-[var(--color-mkhe-input)] border border-[var(--color-mkhe-border)]/50 rounded-lg shadow-xl flex flex-col overflow-hidden transition-colors">
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
                  className={`p-2.5 text-sm cursor-pointer hover:bg-[var(--color-mkhe-primary)]/10 transition-colors ${
                    value === opt
                      ? "bg-[var(--color-mkhe-primary)]/5 font-bold text-[var(--color-mkhe-primary)]"
                      : "text-[var(--color-mkhe-text)]"
                  }`}
                >
                  {opt}
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
