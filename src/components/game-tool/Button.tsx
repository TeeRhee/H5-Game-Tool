import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "neutral";
export type ButtonAppearance = "filled" | "stroke";
export type ButtonSize = "medium" | "small" | "xsmall";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  appearance?: ButtonAppearance;
  size?: ButtonSize;
  iconOnly?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export function Button({
  variant = "primary",
  appearance = "filled",
  size = "small",
  iconOnly = false,
  leftIcon,
  rightIcon,
  children,
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={[
        "gt-button",
        `gt-button--${variant}`,
        `gt-button--${appearance}`,
        `gt-button--${size}`,
        iconOnly ? "gt-button--icon-only" : "",
        className,
      ].join(" ")}
      aria-label={iconOnly && typeof children === "string" ? children : props["aria-label"]}
      {...props}
    >
      {leftIcon ? <span className="gt-button__icon">{leftIcon}</span> : null}
      {iconOnly ? null : <span className="gt-button__label">{children}</span>}
      {rightIcon ? <span className="gt-button__icon">{rightIcon}</span> : null}
    </button>
  );
}

