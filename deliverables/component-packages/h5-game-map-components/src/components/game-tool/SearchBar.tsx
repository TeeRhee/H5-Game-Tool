import { useState } from "react";
import { RemixIcon } from "./RemixIcon";

export interface SearchBarProps {
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  onClear?: () => void;
}

export function SearchBar({
  value,
  placeholder = "搜索",
  onChange,
  onClear,
}: SearchBarProps) {
  const [focused, setFocused] = useState(false);
  const showClear = value.length > 0;

  const clear = () => {
    onChange("");
    onClear?.();
  };

  return (
    <label className={["gt-search", focused ? "gt-search--active" : "", value ? "gt-search--filled" : ""].join(" ")}>
      <RemixIcon name="search-2-line" size={18} className="gt-search__icon" />
      <input
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {showClear ? (
        <button
          type="button"
          className="gt-search__clear"
          onPointerDown={(event) => event.preventDefault()}
          onClick={clear}
          aria-label="清空搜索"
        >
          <RemixIcon name="close-circle-fill" size={18} />
        </button>
      ) : null}
    </label>
  );
}
