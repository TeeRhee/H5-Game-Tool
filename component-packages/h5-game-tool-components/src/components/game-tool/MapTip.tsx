import type { ReactNode } from "react";
import { RemixIcon } from "./RemixIcon";

export interface MapTipProps {
  content?: string;
  visible: boolean;
  x?: number;
  y?: number;
  icon?: ReactNode;
  selected?: boolean;
  onClick?: () => void;
}

export function MapTip({ content, visible, x = 0, y = 0, icon, selected = false, onClick }: MapTipProps) {
  if (!visible || !content) return null;

  return (
    <button
      type="button"
      className={["gt-map-tip", selected ? "gt-map-tip--selected" : ""].join(" ")}
      style={{ left: x, top: y }}
      onClick={onClick}
      aria-label={content}
      title={content}
    >
      <span className="gt-map-tip__body" aria-hidden="true">
        {icon ?? <RemixIcon name="map-pin-line" size={20} />}
      </span>
    </button>
  );
}
