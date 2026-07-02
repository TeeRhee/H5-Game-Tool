import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cx } from "./wikiUtils";

export type ToolTipPlacement = "Right" | "TopLeft" | "TopRight" | "BottomRight" | "TopCenter" | "BottomLeft" | "BottomCenter" | "Left";
export type ToolTipPlacementMode = ToolTipPlacement | "auto";

const AUTO_PLACEMENTS: ToolTipPlacement[] = ["TopLeft", "TopRight", "BottomLeft", "BottomRight", "TopCenter", "BottomCenter", "Left", "Right"];
const VIEWPORT_MARGIN = 8;
const TOOLTIP_GAP = 6;

export interface ToolTipProps {
  content: ReactNode;
  children: ReactNode;
  placement?: ToolTipPlacementMode;
  className?: string;
  bubbleClassName?: string;
  active?: boolean | "auto";
  showDelayMs?: number;
}

function getBoundaryRect(root: HTMLElement) {
  let boundary = {
    left: VIEWPORT_MARGIN,
    top: VIEWPORT_MARGIN,
    right: window.innerWidth - VIEWPORT_MARGIN,
    bottom: window.innerHeight - VIEWPORT_MARGIN,
  };

  let node = root.parentElement;
  while (node && node !== document.body) {
    const style = window.getComputedStyle(node);
    const overflow = `${style.overflow}${style.overflowX}${style.overflowY}`;
    if (/(auto|scroll|hidden|clip)/.test(overflow)) {
      const rect = node.getBoundingClientRect();
      boundary = {
        left: Math.max(boundary.left, rect.left),
        top: Math.max(boundary.top, rect.top),
        right: Math.min(boundary.right, rect.right),
        bottom: Math.min(boundary.bottom, rect.bottom),
      };
    }
    node = node.parentElement;
  }

  return boundary;
}

function getPlacementRect(placement: ToolTipPlacement, rootRect: DOMRect, bubbleRect: DOMRect) {
  const centerX = rootRect.left + rootRect.width / 2;
  const centerY = rootRect.top + rootRect.height / 2;

  switch (placement) {
    case "TopLeft":
      return { left: rootRect.left, top: rootRect.bottom + TOOLTIP_GAP, right: rootRect.left + bubbleRect.width, bottom: rootRect.bottom + TOOLTIP_GAP + bubbleRect.height };
    case "TopCenter":
      return { left: centerX - bubbleRect.width / 2, top: rootRect.bottom + TOOLTIP_GAP, right: centerX + bubbleRect.width / 2, bottom: rootRect.bottom + TOOLTIP_GAP + bubbleRect.height };
    case "TopRight":
      return { left: rootRect.right - bubbleRect.width, top: rootRect.bottom + TOOLTIP_GAP, right: rootRect.right, bottom: rootRect.bottom + TOOLTIP_GAP + bubbleRect.height };
    case "BottomLeft":
      return { left: rootRect.left, top: rootRect.top - TOOLTIP_GAP - bubbleRect.height, right: rootRect.left + bubbleRect.width, bottom: rootRect.top - TOOLTIP_GAP };
    case "BottomCenter":
      return { left: centerX - bubbleRect.width / 2, top: rootRect.top - TOOLTIP_GAP - bubbleRect.height, right: centerX + bubbleRect.width / 2, bottom: rootRect.top - TOOLTIP_GAP };
    case "BottomRight":
      return { left: rootRect.right - bubbleRect.width, top: rootRect.top - TOOLTIP_GAP - bubbleRect.height, right: rootRect.right, bottom: rootRect.top - TOOLTIP_GAP };
    case "Left":
      return { left: rootRect.right + TOOLTIP_GAP, top: centerY - bubbleRect.height / 2, right: rootRect.right + TOOLTIP_GAP + bubbleRect.width, bottom: centerY + bubbleRect.height / 2 };
    case "Right":
      return { left: rootRect.left - TOOLTIP_GAP - bubbleRect.width, top: centerY - bubbleRect.height / 2, right: rootRect.left - TOOLTIP_GAP, bottom: centerY + bubbleRect.height / 2 };
  }
}

function getOverflowScore(rect: ReturnType<typeof getPlacementRect>, boundary: ReturnType<typeof getBoundaryRect>) {
  return (
    Math.max(boundary.left - rect.left, 0) +
    Math.max(rect.right - boundary.right, 0) +
    Math.max(boundary.top - rect.top, 0) +
    Math.max(rect.bottom - boundary.bottom, 0)
  );
}

export function ToolTip({
  content,
  children,
  placement = "auto",
  className = "",
  bubbleClassName = "",
  active = "auto",
  showDelayMs = 120,
}: ToolTipProps) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const bubbleRef = useRef<HTMLSpanElement>(null);
  const [isEnabled, setIsEnabled] = useState(active === true);
  const [resolvedPlacement, setResolvedPlacement] = useState<ToolTipPlacement>(placement === "auto" ? "TopLeft" : placement);

  const measureOverflow = useCallback(() => {
    if (active !== "auto") {
      setIsEnabled(active);
      return;
    }

    const root = rootRef.current;
    const target = root?.firstElementChild instanceof HTMLElement ? root.firstElementChild : root;
    if (!target) {
      setIsEnabled(false);
      return;
    }

    const hasOverflow =
      target.scrollWidth > target.clientWidth + 1 ||
      target.scrollHeight > target.clientHeight + 1;
    const rect = target.getBoundingClientRect();
    const hasHiddenText = Boolean(target.textContent?.trim()) && (rect.width === 0 || rect.height === 0);

    setIsEnabled(hasOverflow || hasHiddenText);
  }, [active]);

  const resolvePlacement = useCallback(() => {
    if (placement !== "auto") {
      setResolvedPlacement(placement);
      return;
    }

    const root = rootRef.current;
    const bubble = bubbleRef.current;
    if (!root || !bubble) return;

    const rootRect = root.getBoundingClientRect();
    const bubbleRect = bubble.getBoundingClientRect();
    const boundary = getBoundaryRect(root);
    const bestPlacement = AUTO_PLACEMENTS.reduce(
      (best, candidate) => {
        const rect = getPlacementRect(candidate, rootRect, bubbleRect);
        const score = getOverflowScore(rect, boundary);
        return score < best.score ? { placement: candidate, score } : best;
      },
      { placement: resolvedPlacement, score: Number.POSITIVE_INFINITY },
    ).placement;

    setResolvedPlacement(bestPlacement);
  }, [placement, resolvedPlacement]);

  const updateBeforeShow = useCallback(() => {
    measureOverflow();
    resolvePlacement();
  }, [measureOverflow, resolvePlacement]);

  useEffect(() => {
    if (!content) {
      setIsEnabled(false);
      return;
    }

    if (active !== "auto") {
      setIsEnabled(active);
      return;
    }

    const root = rootRef.current;
    const target = root?.firstElementChild instanceof HTMLElement ? root.firstElementChild : root;
    if (!root || !target) return;

    let frame = window.requestAnimationFrame(updateBeforeShow);
    const scheduleMeasure = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(updateBeforeShow);
    };
    const observer = new ResizeObserver(scheduleMeasure);
    observer.observe(root);
    observer.observe(target);
    window.addEventListener("resize", scheduleMeasure);

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", scheduleMeasure);
    };
  }, [active, children, content, updateBeforeShow]);

  if (!content) return <>{children}</>;

  return (
    <span
      ref={rootRef}
      className={cx("gt-tool-tip", isEnabled && "gt-tool-tip--enabled", `gt-tool-tip--${resolvedPlacement}`, className)}
      onPointerEnter={updateBeforeShow}
      onFocus={updateBeforeShow}
      style={{ "--gt-tool-tip-show-delay": `${showDelayMs}ms` } as CSSProperties}
    >
      {children}
      <span ref={bubbleRef} className={cx("gt-tool-tip__bubble", bubbleClassName)} role="tooltip">
        {content}
      </span>
    </span>
  );
}
