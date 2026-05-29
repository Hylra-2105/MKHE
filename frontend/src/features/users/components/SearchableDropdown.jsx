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
        className={`w-full p-2 bg-white border border-mkhe-primary/50 rounded min-h-[32px] flex items-center justify-between cursor-pointer focus:ring-2 focus:ring-mkhe-primary/20 text-sm transition-colors ${
          disabled
            ? "bg-gray-100 cursor-not-allowed opacity-60"
            : "hover:border-mkhe-primary"
        }`}
      >
        <span className={value ? "text-mkhe-text" : "text-gray-400"}>
          {value || placeholder}
        </span>
        <span className="text-gray-400 text-[10px] ml-2">▼</span>
      </div>

      {isOpen && (
        <div className="absolute z-[150] top-full left-0 w-full mt-1 bg-white border border-mkhe-border/50 rounded-lg shadow-xl flex flex-col overflow-hidden">
          <div className="p-2 border-b border-gray-100 bg-gray-50">
            <input
              type="text"
              className="w-full p-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-mkhe-primary bg-white"
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
                  className={`p-2.5 text-sm cursor-pointer hover:bg-mkhe-primary/10 transition-colors ${
                    value === opt
                      ? "bg-mkhe-primary/5 font-bold text-mkhe-primary"
                      : "text-mkhe-text"
                  }`}
                >
                  {opt}
                </li>
              ))
            ) : (
              <li className="p-3 text-sm text-gray-400 text-center italic">
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
