import type { ReactNode } from "react";
import { Checkbox, type CheckboxState } from "./Checkbox";
import { RemixIcon } from "./RemixIcon";

export type DropdownItemState = "default" | "hover" | "pressed";

export interface DropdownItemProps {
  label: string;
  count?: number;
  state?: DropdownItemState;
  selected?: boolean;
  child?: boolean;
  collapsed?: boolean;
  checkboxState?: CheckboxState;
  showCheckbox?: boolean;
  showBadge?: boolean;
  showRightIcon?: boolean;
  icon?: ReactNode;
  onClick?: () => void;
  onCheckboxToggle?: () => void;
  onRightIconClick?: () => void;
}

export function DropdownItem({
  label,
  count,
  state = "default",
  selected = false,
  child = false,
  collapsed = false,
  checkboxState = "unchecked",
  showCheckbox = true,
  showBadge,
  showRightIcon = false,
  icon,
  onClick,
  onCheckboxToggle,
  onRightIconClick,
}: DropdownItemProps) {
  const shouldShowBadge = showBadge ?? typeof count === "number";

  return (
    <div
      role="button"
      tabIndex={0}
      className={[
        "gt-dropdown-item",
        `gt-dropdown-item--${state}`,
        selected ? "gt-dropdown-item--selected" : "",
        child ? "gt-dropdown-item--child" : "",
        collapsed ? "gt-dropdown-item--collapsed" : "",
      ].join(" ")}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key !== " " && event.key !== "Enter") return;
        event.preventDefault();
        onClick?.();
      }}
    >
      {showCheckbox ? (
        <Checkbox
          state={checkboxState}
          ariaLabel={label}
          onToggle={onCheckboxToggle}
        />
      ) : null}
      {icon ? <span className="gt-dropdown-item__icon">{icon}</span> : null}
      <span className="gt-dropdown-item__text">
        <span className="gt-dropdown-item__label">{label}</span>
      </span>
      {shouldShowBadge ? <span className="gt-dropdown-item__badge">{count ?? 0}</span> : null}
      {showRightIcon ? (
        <button
          type="button"
          className="gt-dropdown-item__right-icon"
          aria-label={collapsed ? "展开" : "收起"}
          onClick={(event) => {
            event.stopPropagation();
            onRightIconClick?.();
          }}
        >
          <RemixIcon name="arrow-down-s-line" size={20} />
        </button>
      ) : null}
    </div>
  );
}
