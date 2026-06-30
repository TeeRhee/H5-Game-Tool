import { useMemo, useState } from "react";
import type { ButtonHTMLAttributes, CSSProperties, HTMLAttributes } from "react";
import { cx, type WikiVisualState } from "./wikiUtils";

export interface TopBarItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  state?: WikiVisualState;
}

export function TopBarItem({ state = "default", className = "", children, ...props }: TopBarItemProps) {
  return (
    <button type="button" className={cx("gt-wiki-topbar-item", `gt-wiki-topbar-item--${state}`, className)} {...props}>
      {children}
    </button>
  );
}

export interface TopBarProps extends HTMLAttributes<HTMLElement> {
  items?: Array<{ id: string; label: string; state?: WikiVisualState }>;
  activeId?: string;
  defaultActiveId?: string;
  onActiveChange?: (id: string) => void;
}

export function TopBar({
  items,
  activeId,
  defaultActiveId,
  onActiveChange,
  className = "",
  children,
  style,
  ...props
}: TopBarProps) {
  const resolvedItems =
    items ?? [
      { id: "category-1", label: "类型名称", state: "active" as const },
      { id: "category-2", label: "类型名称" },
      { id: "category-3", label: "类型名称" },
      { id: "category-4", label: "类型名称" },
      { id: "category-5", label: "类型名称" },
      { id: "category-6", label: "类型名称" },
      { id: "category-7", label: "类型名称" },
      { id: "category-8", label: "类型名称" },
    ];
  const initialActiveId = useMemo(
    () => defaultActiveId ?? resolvedItems.find((item) => item.state === "active")?.id ?? resolvedItems[0]?.id,
    [defaultActiveId, resolvedItems],
  );
  const [internalActiveId, setInternalActiveId] = useState(initialActiveId);
  const selectedId = activeId ?? internalActiveId;
  const selectedIndex = Math.max(
    resolvedItems.findIndex((item) => item.id === selectedId),
    0,
  );
  const topbarStyle = {
    ...style,
    "--gt-topbar-active-offset": `${selectedIndex * 88}px`,
  } as CSSProperties;

  const handleSelect = (id: string) => {
    if (activeId === undefined) {
      setInternalActiveId(id);
    }
    onActiveChange?.(id);
  };

  return (
    <nav className={cx("gt-wiki-topbar", className)} style={topbarStyle} aria-label="Wiki 主导航" {...props}>
      {children ??
        resolvedItems.map((item) => {
          const itemState = item.id === selectedId ? "active" : item.state === "active" ? "default" : item.state;

          return (
            <TopBarItem
              key={item.id}
              state={itemState}
              aria-current={item.id === selectedId ? "page" : undefined}
              onClick={() => handleSelect(item.id)}
            >
              {item.label}
            </TopBarItem>
          );
        })}
    </nav>
  );
}
