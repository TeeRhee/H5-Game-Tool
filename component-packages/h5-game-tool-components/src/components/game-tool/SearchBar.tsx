import { useState } from "react";
import { RemixIcon } from "./RemixIcon";

export type SearchBarState = "default" | "hover" | "active" | "filled";

export interface SearchBarProps {
  value: string;
  placeholder?: string;
  state?: SearchBarState;
  onChange: (value: string) => void;
  onClear?: () => void;
}

export function SearchBar({
  value,
  placeholder = "搜索",
  state,
  onChange,
  onClear,
}: SearchBarProps) {
  const [focused, setFocused] = useState(false);
  const showClear = value.length > 0;
  const visualState = state ?? (focused ? "active" : value ? "filled" : "default");

  const clear = () => {
    onChange("");
    onClear?.();
  };

  return (
    <label className={["gt-search", `gt-search--${visualState}`].join(" ")}>
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
