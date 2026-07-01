import type { ReactNode } from "react";
import { cx } from "./wikiUtils";

export type ToolTipPlacement = "Right" | "TopLeft" | "TopRight" | "BottomRight" | "TopCenter" | "BottomLeft" | "BottomCenter" | "Left";

export interface ToolTipProps {
  content: ReactNode;
  children: ReactNode;
  placement?: ToolTipPlacement;
  className?: string;
  bubbleClassName?: string;
}

export function ToolTip({ content, children, placement = "TopLeft", className = "", bubbleClassName = "" }: ToolTipProps) {
  if (!content) return <>{children}</>;

  return (
    <span className={cx("gt-tool-tip", `gt-tool-tip--${placement}`, className)}>
      {children}
      <span className={cx("gt-tool-tip__bubble", bubbleClassName)} role="tooltip">
        {content}
      </span>
    </span>
  );
}
