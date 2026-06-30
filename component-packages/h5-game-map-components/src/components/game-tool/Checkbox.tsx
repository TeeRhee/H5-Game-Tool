import { RemixIcon } from "./RemixIcon";

export type CheckboxState = "checked" | "unchecked" | "indeterminate";
export type CheckboxInteractionState = "default" | "hover" | "pressed" | "disabled";

export interface CheckboxProps {
  state: CheckboxState;
  interactionState?: CheckboxInteractionState;
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
  onToggle?: () => void;
}

export function Checkbox({
  state,
  interactionState = "default",
  disabled = false,
  className,
  ariaLabel = "Toggle option",
  onToggle,
}: CheckboxProps) {
  const resolvedInteractionState = disabled ? "disabled" : interactionState;

  return (
    <span
      className={[
        "gt-checkbox",
        `gt-checkbox--${state}`,
        `gt-checkbox--${resolvedInteractionState}`,
        className ?? "",
      ].join(" ")}
      role="checkbox"
      aria-checked={state === "indeterminate" ? "mixed" : state === "checked"}
      aria-disabled={disabled}
      aria-label={ariaLabel}
      tabIndex={onToggle && !disabled ? 0 : undefined}
      onClick={(event) => {
        if (disabled || !onToggle) return;
        event.stopPropagation();
        onToggle();
      }}
      onKeyDown={(event) => {
        if (disabled || !onToggle) return;
        if (event.key !== " " && event.key !== "Enter") return;
        event.preventDefault();
        event.stopPropagation();
        onToggle();
      }}
    >
      {state === "checked" ? <RemixIcon name="check-line" size={12} /> : null}
      {state === "indeterminate" ? <RemixIcon name="subtract-line" size={12} /> : null}
    </span>
  );
}
