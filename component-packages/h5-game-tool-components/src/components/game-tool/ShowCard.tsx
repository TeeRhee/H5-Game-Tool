import type { ButtonHTMLAttributes } from "react";
import { Badge } from "./Badge";
import { ImageFrame } from "./ImageFrame";
import { ProgressBar } from "./ProgressBar";
import { RemixIcon } from "./RemixIcon";
import { cx } from "./wikiUtils";

export interface ShowCardProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  title: string;
  description?: string;
  imageSrc?: string;
  label?: string;
  progress?: number;
  variant?: "label" | "process";
  subscribed?: boolean;
}

export function ShowCard({
  title,
  description,
  imageSrc,
  label,
  progress,
  variant = "label",
  subscribed = false,
  className = "",
  ...props
}: ShowCardProps) {
  const progressValue = typeof progress === "number" ? progress : 80;
  const hasImage = Boolean(imageSrc);

  return (
    <button type="button" className={cx("gt-wiki-show-card", `gt-wiki-show-card--${variant}`, hasImage ? "" : "gt-wiki-show-card--no-image", className)} {...props}>
      {hasImage ? <ImageFrame ratio="1:1" src={imageSrc} alt="" /> : null}
      {variant === "process" ? (
        <span className="gt-wiki-show-card__progress">
          <span className="gt-wiki-show-card__progress-top">
            <span className="gt-wiki-show-card__title">{title}</span>
            <span className="gt-wiki-show-card__progress-value">{progressValue}%</span>
          </span>
          <ProgressBar value={progressValue} className="gt-wiki-show-card__progress-bar" />
          {description ? <span className="gt-wiki-show-card__description">{description}</span> : null}
        </span>
      ) : (
        <span className="gt-wiki-show-card__content">
          <span className="gt-wiki-show-card__title">{title}</span>
          {description ? <span className="gt-wiki-show-card__description">{description}</span> : null}
        </span>
      )}
      {label ? <Badge tone={subscribed ? "success" : "neutral"}>{label}</Badge> : null}
      <RemixIcon name="arrow-right-s-line" size={20} className="gt-wiki-show-card__arrow" />
    </button>
  );
}
