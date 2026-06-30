import type { ButtonHTMLAttributes, HTMLAttributes } from "react";
import { RemixIcon } from "./RemixIcon";
import { cx } from "./wikiUtils";

export interface PaginationCellProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  state?: "default" | "hover" | "selected";
}

export function PaginationCell({ state = "default", className = "", children, ...props }: PaginationCellProps) {
  return (
    <button type="button" className={cx("gt-wiki-pagination-cell", `gt-wiki-pagination-cell--${state}`, className)} {...props}>
      {children}
    </button>
  );
}

export interface PaginationProps extends HTMLAttributes<HTMLElement> {
  page?: number;
  totalPages?: number;
}

function getVisiblePages(totalPages: number) {
  if (totalPages <= 6) return Array.from({ length: totalPages }, (_item, index) => String(index + 1));
  return ["1", "2", "3", "4", "5", "...", String(totalPages)];
}

export function Pagination({ page = 1, totalPages = 24, className = "", ...props }: PaginationProps) {
  const pages = getVisiblePages(totalPages);

  return (
    <nav className={cx("gt-wiki-pagination", className)} aria-label="分页" {...props}>
      <div className="gt-wiki-pagination__summary">第 {page} 页，共 {totalPages} 页</div>
      <div className="gt-wiki-pagination__controls">
        <button type="button" className="gt-wiki-pagination__arrow" aria-label="上一页">
          <RemixIcon name="arrow-left-s-line" size={20} />
        </button>
        <div className="gt-wiki-pagination__cells">
          {pages.map((item, index) => (
            <PaginationCell key={`${item}-${index}`} state={item === String(page) ? "selected" : "default"}>
              {item}
            </PaginationCell>
          ))}
        </div>
        <button type="button" className="gt-wiki-pagination__arrow" aria-label="下一页">
          <RemixIcon name="arrow-right-s-line" size={20} />
        </button>
      </div>
    </nav>
  );
}
