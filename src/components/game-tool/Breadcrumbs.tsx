import type { ButtonHTMLAttributes, HTMLAttributes } from "react";
import { RemixIcon } from "./RemixIcon";
import { cx } from "./wikiUtils";

export interface BreadcrumbItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  state?: "default" | "hover" | "active";
}

export function BreadcrumbItem({ state = "default", className = "", children, ...props }: BreadcrumbItemProps) {
  return (
    <button type="button" className={cx("gt-wiki-breadcrumb-item", `gt-wiki-breadcrumb-item--${state}`, className)} {...props}>
      {children}
    </button>
  );
}

export interface BreadcrumbsProps extends HTMLAttributes<HTMLElement> {
  items?: Array<{ id: string; label: string; state?: "default" | "hover" | "active" }>;
  onItemClick?: (item: { id: string; label: string; state?: "default" | "hover" | "active" }, index: number) => void;
}

export function Breadcrumbs({ items, onItemClick, className = "", ...props }: BreadcrumbsProps) {
  const resolvedItems =
    items ?? [
      { id: "home", label: "首页" },
      { id: "category", label: "资料库" },
      { id: "detail", label: "详情" },
    ];

  return (
    <nav className={cx("gt-wiki-breadcrumbs", className)} aria-label="面包屑" {...props}>
      {resolvedItems.map((item, index) => {
        const state = item.state ?? (index === resolvedItems.length - 1 ? "active" : "default");
        return (
          <span key={item.id} className="gt-wiki-breadcrumbs__part">
            <BreadcrumbItem state={state} aria-current={state === "active" ? "page" : undefined} onClick={() => onItemClick?.(item, index)}>
              {item.label}
            </BreadcrumbItem>
            {index < resolvedItems.length - 1 ? <RemixIcon name="arrow-right-s-line" size={20} className="gt-wiki-breadcrumbs__separator" /> : null}
          </span>
        );
      })}
    </nav>
  );
}
