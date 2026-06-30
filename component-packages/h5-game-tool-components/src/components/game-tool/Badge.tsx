import type { HTMLAttributes } from "react";
import { cx } from "./wikiUtils";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: "neutral" | "info" | "error" | "warning" | "primary" | "success";
}

export function Badge({ tone = "neutral", className = "", children, ...props }: BadgeProps) {
  return (
    <span className={cx("gt-wiki-badge", `gt-wiki-badge--${tone}`, className)} {...props}>
      {children}
    </span>
  );
}
