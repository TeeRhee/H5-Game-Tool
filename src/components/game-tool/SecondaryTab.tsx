import type { ButtonHTMLAttributes } from "react";
import { cx } from "./wikiUtils";

export type SecondaryTabState = "default" | "active";

export interface SecondaryTabProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  state?: SecondaryTabState;
}

export function SecondaryTab({ state = "default", className = "", children, ...props }: SecondaryTabProps) {
  const isActive = state === "active";

  return (
    <button
      type="button"
      className={cx("gt-wiki-secondary-tab", `gt-wiki-secondary-tab--${state}`, className)}
      aria-current={isActive ? "page" : undefined}
      {...props}
    >
      {children}
    </button>
  );
}
