import React, { useState, useEffect, useRef, useMemo } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, Check, Search } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  id?: string;
  searchable?: boolean;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  disabled = false,
  className = "",
  placeholder = "Select an option",
  id,
  searchable = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [openUpward, setOpenUpward] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionsListRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Find currently selected option
  const selectedOption = useMemo(() => {
    return options.find((opt) => opt.value === value) || null;
  }, [options, value]);

  // Determine if we should show search inside dropdown
  const showSearch = searchable || options.length > 5;

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    if (!searchQuery) return options;
    const query = searchQuery.toLowerCase().trim();
    return options.filter((opt) => opt.label.toLowerCase().includes(query));
  }, [options, searchQuery]);

  // Handle opening check for viewport overflow
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      // If there's less than 280px below and more space above, open upward
      if (spaceBelow < 280 && spaceAbove > spaceBelow) {
        setOpenUpward(true);
      } else {
        setOpenUpward(false);
      }
      
      // Auto-focus search input if visible
      if (showSearch) {
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 50);
      }

      // Initialize highlighted index to selected or first item
      const currentSelectedIdx = filteredOptions.findIndex((opt) => opt.value === value);
      setHighlightedIndex(currentSelectedIdx >= 0 ? currentSelectedIdx : 0);
    } else {
      setSearchQuery("");
      setHighlightedIndex(-1);
    }
  }, [isOpen, filteredOptions, value, showSearch]);

  // Handle outside click to close
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen]);

  // Keyboard Navigation handler
  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    // Dropdown is open:
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) => {
          const nextIdx = prev + 1;
          return nextIdx >= filteredOptions.length ? 0 : nextIdx;
        });
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => {
          const prevIdx = prev - 1;
          return prevIdx < 0 ? filteredOptions.length - 1 : prevIdx;
        });
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          onChange(filteredOptions[highlightedIndex].value);
          setIsOpen(false);
          triggerRef.current?.focus();
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        triggerRef.current?.focus();
        break;
      case "Tab":
        // Allow default tab behavior but close the list
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && optionsListRef.current) {
      const activeEl = optionsListRef.current.children[highlightedIndex] as HTMLElement;
      if (activeEl) {
        const listEl = optionsListRef.current;
        const activeTop = activeEl.offsetTop;
        const activeBottom = activeTop + activeEl.offsetHeight;
        const listScrollTop = listEl.scrollTop;
        const listHeight = listEl.clientHeight;

        if (activeBottom > listScrollTop + listHeight) {
          listEl.scrollTop = activeBottom - listHeight;
        } else if (activeTop < listScrollTop) {
          listEl.scrollTop = activeTop;
        }
      }
    }
  }, [highlightedIndex]);

  const selectOptionValue = (val: string) => {
    onChange(val);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      id={id ? `${id}-container` : undefined}
    >
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-disabled={disabled}
        className={`
          flex justify-between items-center w-full text-left cursor-pointer transition-all duration-200
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          ${isOpen ? "border-cyan-500/70 ring-2 ring-cyan-500/20" : ""}
          ${className}
        `}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-app-text-muted transition-transform duration-200 ml-2 shrink-0 ${
            isOpen ? "rotate-180 text-cyan-500" : ""
          }`}
        />
      </button>

      {/* Floating Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: openUpward ? 4 : -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: openUpward ? 4 : -4 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            style={{ zIndex: 9999 }}
            className={`
              absolute left-0 w-full rounded-xl custom-select-dropdown border
              ${openUpward ? "bottom-[calc(100%+6px)]" : "top-[calc(100%+6px)]"}
            `}
          >
            {/* Search Input inside Dropdown */}
            {showSearch && (
              <div className="flex items-center gap-2 px-3 py-2 border-b border-app-border/10">
                <Search className="h-3.5 w-3.5 text-app-text-muted shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-transparent text-xs border-0 outline-none focus:ring-0 text-app-text placeholder-app-text-muted/50"
                />
              </div>
            )}

            {/* Options List */}
            <div
              ref={optionsListRef}
              role="listbox"
              aria-activedescendant={
                highlightedIndex >= 0 ? `option-${highlightedIndex}` : undefined
              }
              className="max-h-60 overflow-y-auto py-1 no-scrollbar touch-pan-y"
            >
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-3 text-xs text-app-text-muted text-center italic">
                  No matching items
                </div>
              ) : (
                filteredOptions.map((opt, idx) => {
                  const isSelected = opt.value === value;
                  const isHighlighted = idx === highlightedIndex;

                  return (
                    <div
                      key={opt.value}
                      id={`option-${idx}`}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => selectOptionValue(opt.value)}
                      onMouseEnter={() => setHighlightedIndex(idx)}
                      className={`
                        flex items-center justify-between px-3.5 py-2.5 text-xs font-medium cursor-pointer transition-all duration-150 rounded-lg mx-1 my-0.5
                        ${isHighlighted ? "custom-select-item-hover" : "text-app-text-secondary"}
                        ${isSelected ? "custom-select-selected" : ""}
                      `}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {/* Colored left indicator */}
                        <span
                          className={`w-1.5 h-1.5 rounded-full shrink-0 transition-all ${
                            isSelected ? "bg-cyan-400 scale-100" : "bg-transparent scale-0"
                          }`}
                        />
                        <span className="truncate">{opt.label}</span>
                      </div>

                      {isSelected && (
                        <Check className="h-3.5 w-3.5 text-cyan-400 shrink-0 ml-2" />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
