import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "./wikiUtils";

export interface TableHeaderCellProps extends HTMLAttributes<HTMLDivElement> {
  align?: "left" | "center" | "right";
}

export function TableHeaderCell({ align = "left", className = "", children, ...props }: TableHeaderCellProps) {
  return (
    <div className={cx("gt-wiki-table-header-cell", `gt-wiki-table-cell--${align}`, className)} role="columnheader" {...props}>
      {children}
    </div>
  );
}

export interface TableRowCellProps extends HTMLAttributes<HTMLDivElement> {
  icon?: ReactNode;
  state?: "default" | "none";
}

export function TableRowCell({ icon, state = "default", className = "", children, ...props }: TableRowCellProps) {
  return (
    <div className={cx("gt-wiki-table-row-cell", `gt-wiki-table-row-cell--${state}`, className)} role="cell" {...props}>
      {icon ? <span className="gt-wiki-table-row-cell__icon">{icon}</span> : null}
      <span className="gt-wiki-table-row-cell__content">{children}</span>
    </div>
  );
}
