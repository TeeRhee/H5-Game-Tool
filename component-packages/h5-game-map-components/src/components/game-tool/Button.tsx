import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "neutral";
export type ButtonAppearance = "filled" | "stroke";
export type ButtonSize = "medium" | "small" | "xsmall";
export type ButtonState = "default" | "hover" | "focus" | "disabled";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  appearance?: ButtonAppearance;
  size?: ButtonSize;
  state?: ButtonState;
  iconOnly?: boolean;
  showLeftIcon?: boolean;
  showRightIcon?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export function Button({
  variant = "primary",
  appearance = "filled",
  size = "small",
  state = "default",
  iconOnly = false,
  showLeftIcon = true,
  showRightIcon = true,
  leftIcon,
  rightIcon,
  children,
  className = "",
  type = "button",
  disabled = false,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || state === "disabled";

  return (
    <button
      type={type}
      className={[
        "gt-button",
        `gt-button--${variant}`,
        `gt-button--${appearance}`,
        `gt-button--${size}`,
        `gt-button--state-${state}`,
        iconOnly ? "gt-button--icon-only" : "",
        className,
      ].join(" ")}
      disabled={isDisabled}
      aria-label={iconOnly && typeof children === "string" ? children : props["aria-label"]}
      {...props}
    >
      {showLeftIcon && leftIcon ? <span className="gt-button__icon">{leftIcon}</span> : null}
      {iconOnly ? null : <span className="gt-button__label">{children}</span>}
      {showRightIcon && rightIcon ? <span className="gt-button__icon">{rightIcon}</span> : null}
    </button>
  );
}
