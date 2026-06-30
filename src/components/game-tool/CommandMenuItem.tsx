import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Badge } from "./Badge";
import { RemixIcon } from "./RemixIcon";
import { cx } from "./wikiUtils";

export interface CommandMenuItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode;
  badge?: string;
  showBadge?: boolean;
  state?: "default" | "hover";
  variant?: "base" | "leftIcon";
}

export function CommandMenuItem({
  icon,
  badge = "标签",
  showBadge = true,
  state = "default",
  variant,
  className = "",
  children,
  ...props
}: CommandMenuItemProps) {
  const resolvedVariant = variant ?? (icon ? "leftIcon" : "base");

  return (
    <button
      type="button"
      className={cx("gt-wiki-command-item", `gt-wiki-command-item--${resolvedVariant}`, `gt-wiki-command-item--${state}`, className)}
      {...props}
    >
      <span className="gt-wiki-command-item__content">
        {resolvedVariant === "leftIcon" ? <span className="gt-wiki-command-item__icon">{icon ?? <RemixIcon name="settings-2-line" size={18} />}</span> : null}
        <span className="gt-wiki-command-item__label">{children}</span>
      </span>
      <span className="gt-wiki-command-item__actions">
        {showBadge && badge ? <Badge>{badge}</Badge> : null}
        <RemixIcon name="arrow-right-s-line" size={20} />
      </span>
    </button>
  );
}
