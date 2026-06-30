import type { HTMLAttributes } from "react";
import { cx } from "./wikiUtils";

export function Background({ className = "", children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cx("gt-wiki-background", className)} {...props}>
      {children}
    </div>
  );
}
