import { RemixIcon } from "./RemixIcon";

export type DropdownOptionState = "default" | "hover" | "selected" | "active";

export interface DropdownOptionProps {
  label: string;
  state?: DropdownOptionState;
  selected?: boolean;
  onClick?: () => void;
}

export function DropdownOption({
  label,
  state = "default",
  selected = false,
  onClick,
}: DropdownOptionProps) {
  const resolvedState = selected ? "selected" : state;

  return (
    <button
      type="button"
      className={["gt-dropdown-option", `gt-dropdown-option--${resolvedState}`].join(" ")}
      role="option"
      aria-selected={selected}
      onClick={onClick}
    >
      <span className="gt-dropdown-option__label">{label}</span>
      {selected || resolvedState === "active" ? (
        <RemixIcon name="check-line" size={16} className="gt-dropdown-option__check" />
      ) : null}
    </button>
  );
}

