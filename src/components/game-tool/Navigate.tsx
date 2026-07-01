import { useMemo, useState } from "react";
import type { ButtonHTMLAttributes, HTMLAttributes } from "react";
import { cx } from "./wikiUtils";

export interface NavigateItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  state?: "default" | "hover" | "active";
}

export function NavigateItem({ state = "default", className = "", children, ...props }: NavigateItemProps) {
  return (
    <button type="button" className={cx("gt-wiki-navigate-item", `gt-wiki-navigate-item--${state}`, className)} {...props}>
      {children}
    </button>
  );
}

export interface NavigateProps extends HTMLAttributes<HTMLElement> {
  items?: Array<{ id: string; label: string; state?: "default" | "hover" | "active" }>;
  activeId?: string;
  defaultActiveId?: string;
  onActiveChange?: (id: string) => void;
}

export function Navigate({ items, activeId, defaultActiveId, onActiveChange, className = "", children, ...props }: NavigateProps) {
  const resolvedItems =
    items ?? [
      { id: "intro", label: "顶部导航", state: "active" as const },
      { id: "data", label: "顶部导航" },
      { id: "tips", label: "顶部导航" },
      { id: "media", label: "顶部导航" },
      { id: "related", label: "顶部导航" },
    ];
  const initialActiveId = useMemo(
    () => defaultActiveId ?? resolvedItems.find((item) => item.state === "active")?.id ?? resolvedItems[0]?.id,
    [defaultActiveId, resolvedItems],
  );
  const [internalActiveId, setInternalActiveId] = useState(initialActiveId);
  const selectedId = activeId ?? internalActiveId;

  const handleSelect = (id: string) => {
    if (activeId === undefined) {
      setInternalActiveId(id);
    }
    onActiveChange?.(id);
  };

  return (
    <nav className={cx("gt-wiki-navigate", className)} aria-label="页内导航" {...props}>
      <div className="gt-wiki-navigate__list">
        {children ??
          resolvedItems.map((item) => {
            const itemState = item.id === selectedId ? "active" : item.state === "active" ? "default" : item.state;

            return (
              <NavigateItem
                key={item.id}
                state={itemState}
                aria-current={item.id === selectedId ? "page" : undefined}
                onClick={() => handleSelect(item.id)}
              >
                {item.label}
              </NavigateItem>
            );
          })}
      </div>
    </nav>
  );
}
