import type { CSSProperties } from "react";

export interface ScrollProps {
  className?: string;
  scrollTop?: number;
  scrollHeight?: number;
  viewportHeight?: number;
  trackHeight?: number;
  trackPadding?: number;
  thumbHeight?: number;
  visible?: boolean;
}

export function Scroll({
  className = "",
  scrollTop = 0,
  scrollHeight = 0,
  viewportHeight = 0,
  trackHeight,
  trackPadding = 8,
  thumbHeight = 80,
  visible = true,
}: ScrollProps) {
  const maxScrollTop = Math.max(scrollHeight - viewportHeight, 0);
  const resolvedTrackHeight = trackHeight ?? viewportHeight;
  const maxThumbTop = Math.max(resolvedTrackHeight - thumbHeight - trackPadding * 2, 0);
  const clampedScrollTop = Math.min(Math.max(scrollTop, 0), maxScrollTop);
  const thumbTop = maxScrollTop > 0 ? trackPadding + (clampedScrollTop / maxScrollTop) * maxThumbTop : trackPadding;

  if (!visible) return null;

  return (
    <div
      className={["gt-scroll", className].join(" ")}
      aria-hidden="true"
      style={{
        "--gt-scroll-track-height": trackHeight == null ? undefined : `${trackHeight}px`,
        "--gt-scroll-track-padding": `${trackPadding}px`,
        "--gt-scroll-thumb-height": `${thumbHeight}px`,
        "--gt-scroll-thumb-top": `${thumbTop}px`,
      } as CSSProperties}
    >
      <span className="gt-scroll__thumb" />
    </div>
  );
}
