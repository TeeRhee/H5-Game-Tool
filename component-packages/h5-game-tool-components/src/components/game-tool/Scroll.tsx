export interface ScrollProps {
  className?: string;
  scrollTop?: number;
  scrollHeight?: number;
  viewportHeight?: number;
  thumbHeight?: number;
  visible?: boolean;
}

export function Scroll({
  className = "",
  scrollTop = 0,
  scrollHeight = 0,
  viewportHeight = 0,
  thumbHeight = 80,
  visible = true,
}: ScrollProps) {
  const maxScrollTop = Math.max(scrollHeight - viewportHeight, 0);
  const maxThumbTop = Math.max(viewportHeight - thumbHeight - 16, 0);
  const thumbTop = maxScrollTop > 0 ? 8 + (scrollTop / maxScrollTop) * maxThumbTop : 8;

  if (!visible) return null;

  return (
    <div className={["gt-scroll", className].join(" ")} aria-hidden="true">
      <span
        className="gt-scroll__thumb"
        style={{
          height: thumbHeight,
          transform: `translateY(${thumbTop}px)`,
        }}
      />
    </div>
  );
}
