import type { HTMLAttributes } from "react";
import { cx } from "./wikiUtils";

export interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
}

export function ProgressBar({ value, className = "", ...props }: ProgressBarProps) {
  const normalized = Math.min(Math.max(value, 0), 100);
  return (
    <div className={cx("gt-wiki-progress-bar", className)} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={normalized} {...props}>
      <span style={{ width: `${normalized}%` }} />
    </div>
  );
}

export interface ProgressBarLabelProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  value: number;
  description?: string;
  placement?: "onTop" | "onRight";
  showBottom?: boolean;
}

export function ProgressBarLabel({ title, value, description, placement = "onTop", showBottom = true, className = "", ...props }: ProgressBarLabelProps) {
  return (
    <div className={cx("gt-wiki-progress-label", `gt-wiki-progress-label--${placement}`, className)} {...props}>
      <div className="gt-wiki-progress-label__top">
        <span>{title}</span>
        <strong>{value}%</strong>
      </div>
      <ProgressBar value={value} />
      {showBottom && description ? <p>{description}</p> : null}
    </div>
  );
}
