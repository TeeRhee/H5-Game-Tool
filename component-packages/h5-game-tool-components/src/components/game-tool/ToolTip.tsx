import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
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

function getBoundaryRect() {
  return {
    left: VIEWPORT_MARGIN,
    top: VIEWPORT_MARGIN,
    right: window.innerWidth - VIEWPORT_MARGIN,
    bottom: window.innerHeight - VIEWPORT_MARGIN,
  };
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
  const showTimerRef = useRef<number | null>(null);
  const [isEnabled, setIsEnabled] = useState(active === true);
  const [isVisible, setIsVisible] = useState(false);
  const [resolvedPlacement, setResolvedPlacement] = useState<ToolTipPlacement>(placement === "auto" ? "TopLeft" : placement);
  const [bubbleStyle, setBubbleStyle] = useState<CSSProperties>({});

  const measureOverflow = useCallback(() => {
    if (active !== "auto") {
      setIsEnabled(active);
      return active;
    }

    const root = rootRef.current;
    const target = root?.firstElementChild instanceof HTMLElement ? root.firstElementChild : root;
    if (!target) {
      setIsEnabled(false);
      return false;
    }

    const hasOverflow =
      target.scrollWidth > target.clientWidth + 1 ||
      target.scrollHeight > target.clientHeight + 1;
    const rect = target.getBoundingClientRect();
    const hasHiddenText = Boolean(target.textContent?.trim()) && (rect.width === 0 || rect.height === 0);

    const nextEnabled = hasOverflow || hasHiddenText;
    setIsEnabled(nextEnabled);
    return nextEnabled;
  }, [active]);

  const resolvePlacement = useCallback(() => {
    const root = rootRef.current;
    const bubble = bubbleRef.current;
    if (!root || !bubble) return resolvedPlacement;

    if (placement !== "auto") {
      setResolvedPlacement(placement);
      const rootRect = root.getBoundingClientRect();
      const bubbleRect = bubble.getBoundingClientRect();
      const rect = getPlacementRect(placement, rootRect, bubbleRect);
      setBubbleStyle({ left: rect.left, top: rect.top, "--gt-tool-tip-show-delay": `${showDelayMs}ms` } as CSSProperties);
      return placement;
    }

    const rootRect = root.getBoundingClientRect();
    const bubbleRect = bubble.getBoundingClientRect();
    const boundary = getBoundaryRect();
    const best = AUTO_PLACEMENTS.reduce(
      (best, candidate) => {
        const rect = getPlacementRect(candidate, rootRect, bubbleRect);
        const score = getOverflowScore(rect, boundary);
        return score < best.score ? { placement: candidate, score, rect } : best;
      },
      { placement: resolvedPlacement, score: Number.POSITIVE_INFINITY, rect: getPlacementRect(resolvedPlacement, rootRect, bubbleRect) },
    );

    const maxLeft = Math.max(boundary.left, boundary.right - bubbleRect.width);
    const maxTop = Math.max(boundary.top, boundary.bottom - bubbleRect.height);
    setResolvedPlacement(best.placement);
    setBubbleStyle({
      left: Math.min(Math.max(best.rect.left, boundary.left), maxLeft),
      top: Math.min(Math.max(best.rect.top, boundary.top), maxTop),
      "--gt-tool-tip-show-delay": `${showDelayMs}ms`,
    } as CSSProperties);
    return best.placement;
  }, [placement, resolvedPlacement, showDelayMs]);

  const updateBeforeShow = useCallback(() => {
    const nextEnabled = measureOverflow();
    resolvePlacement();
    return nextEnabled;
  }, [measureOverflow, resolvePlacement]);

  const clearShowTimer = useCallback(() => {
    if (showTimerRef.current != null) {
      window.clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }
  }, []);

  const showBubble = useCallback(() => {
    clearShowTimer();
    const nextEnabled = updateBeforeShow();
    if (!nextEnabled) {
      setIsVisible(false);
      return;
    }

    showTimerRef.current = window.setTimeout(() => {
      updateBeforeShow();
      setIsVisible(true);
    }, showDelayMs);
  }, [clearShowTimer, showDelayMs, updateBeforeShow]);

  const hideBubble = useCallback(() => {
    clearShowTimer();
    setIsVisible(false);
  }, [clearShowTimer]);

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
    window.addEventListener("scroll", scheduleMeasure, true);

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", scheduleMeasure);
      window.removeEventListener("scroll", scheduleMeasure, true);
    };
  }, [active, children, content, updateBeforeShow]);

  useEffect(() => clearShowTimer, [clearShowTimer]);

  if (!content) return <>{children}</>;

  const bubble =
    typeof document === "undefined"
      ? null
      : createPortal(
          <span
            ref={bubbleRef}
            className={cx(
              "gt-tool-tip__bubble",
              "gt-tool-tip__bubble--portal",
              `gt-tool-tip__bubble--${resolvedPlacement}`,
              isEnabled && isVisible && "gt-tool-tip__bubble--visible",
              bubbleClassName,
            )}
            style={bubbleStyle}
            role="tooltip"
          >
            {content}
          </span>,
          document.body,
        );

  return (
    <span
      ref={rootRef}
      className={cx("gt-tool-tip", isEnabled && "gt-tool-tip--enabled", `gt-tool-tip--${resolvedPlacement}`, className)}
      onPointerEnter={showBubble}
      onPointerLeave={hideBubble}
      onFocus={showBubble}
      onBlur={hideBubble}
      style={{ "--gt-tool-tip-show-delay": `${showDelayMs}ms` } as CSSProperties}
    >
      {children}
      {bubble}
    </span>
  );
}
