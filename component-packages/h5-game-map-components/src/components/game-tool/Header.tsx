import type { HTMLAttributes } from "react";
import { SearchBar } from "./SearchBar";
import { TopBar } from "./TopBar";
import { cx } from "./wikiUtils";

export interface HeaderProps extends HTMLAttributes<HTMLElement> {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
}

const headerTopBarItems = Array.from({ length: 8 }, (_, index) => ({
  id: `category-${index + 1}`,
  label: "类型名称",
  state: index === 0 ? ("active" as const) : undefined,
}));

export function Header({
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "搜索栏",
  className = "",
  children,
  ...props
}: HeaderProps) {
  return (
    <header className={cx("gt-wiki-header", className)} {...props}>
      {children ?? <TopBar items={headerTopBarItems} />}
      <div className="gt-wiki-header__search">
        <SearchBar value={searchValue} placeholder={searchPlaceholder} onChange={onSearchChange ?? (() => undefined)} />
      </div>
    </header>
  );
}
