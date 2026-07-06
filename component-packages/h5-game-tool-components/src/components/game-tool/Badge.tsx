import type { HTMLAttributes, MouseEventHandler, ReactNode } from "react";
import { RemixIcon } from "./RemixIcon";
import { cx } from "./wikiUtils";

export type BadgeTone = "neutral" | "info" | "error" | "warning" | "primary" | "success";
export type BadgeVariant = "default" | "counter";

export interface BadgeProps extends HTMLAttributes<HTMLElement> {
  tone?: BadgeTone;
  variant?: BadgeVariant;
  decrementLabel?: string;
  incrementLabel?: string;
  decrementDisabled?: boolean;
  incrementDisabled?: boolean;
  onDecrement?: MouseEventHandler<HTMLButtonElement>;
  onIncrement?: MouseEventHandler<HTMLButtonElement>;
}

function BadgeValue({
  tone,
  className,
  children,
  ...props
}: {
  tone: BadgeTone;
  className?: string;
  children: ReactNode;
} & HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cx("gt-wiki-badge", `gt-wiki-badge--${tone}`, className)} {...props}>
      {children}
    </span>
  );
}

export function Badge({
  tone = "neutral",
  variant = "default",
  className = "",
  children,
  decrementLabel = "Decrease badge value",
  incrementLabel = "Increase badge value",
  decrementDisabled = false,
  incrementDisabled = false,
  onDecrement,
  onIncrement,
  ...props
}: BadgeProps) {
  if (variant === "counter") {
    const isDecrementDisabled = decrementDisabled || !onDecrement;
    const isIncrementDisabled = incrementDisabled || !onIncrement;

    return (
      <div className={cx("gt-wiki-badge-counter", className)} {...props}>
        <button
          type="button"
          className="gt-wiki-badge-counter__button"
          onClick={onDecrement}
          aria-label={decrementLabel}
          disabled={isDecrementDisabled}
        >
          <RemixIcon name="subtract-line" size={18} />
        </button>
        <BadgeValue tone={tone} className="gt-wiki-badge-counter__value">
          {children}
        </BadgeValue>
        <button
          type="button"
          className="gt-wiki-badge-counter__button"
          onClick={onIncrement}
          aria-label={incrementLabel}
          disabled={isIncrementDisabled}
        >
          <RemixIcon name="add-line" size={18} />
        </button>
      </div>
    );
  }

  return (
    <BadgeValue tone={tone} className={className} {...props}>
      {children}
    </BadgeValue>
  );
}
