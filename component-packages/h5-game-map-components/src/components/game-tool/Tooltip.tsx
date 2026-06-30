import type { ReactNode } from "react";
import { RemixIcon } from "./RemixIcon";

export interface TooltipProps {
  content?: string;
  visible: boolean;
  x?: number;
  y?: number;
  icon?: ReactNode;
  selected?: boolean;
  onClick?: () => void;
}

export function Tooltip({ content, visible, x = 0, y = 0, icon, selected = false, onClick }: TooltipProps) {
  if (!visible || !content) return null;

  return (
    <button
      type="button"
      className={["gt-tooltip", selected ? "gt-tooltip--selected" : ""].join(" ")}
      style={{ left: x, top: y }}
      onClick={onClick}
      aria-label={content}
      title={content}
    >
      <span className="gt-tooltip__body" aria-hidden="true">
        {icon ?? <RemixIcon name="map-pin-line" size={20} />}
      </span>
    </button>
  );
}
