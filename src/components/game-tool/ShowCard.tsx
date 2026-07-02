import type { ButtonHTMLAttributes } from "react";
import { Badge } from "./Badge";
import { ImageFrame, type ImageRatio } from "./ImageFrame";
import { ProgressBar } from "./ProgressBar";
import { RemixIcon } from "./RemixIcon";
import { ToolTip } from "./ToolTip";
import { cx } from "./wikiUtils";

export interface ShowCardProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  title: string;
  description?: string;
  imageSrc?: string;
  imageRatio?: ImageRatio;
  label?: string;
  progress?: number;
  variant?: "label" | "process";
  subscribed?: boolean;
  targetRoute?: string;
  hasNextLevel?: boolean;
  showRightIcon?: boolean;
}

export function ShowCard({
  title,
  description,
  imageSrc,
  imageRatio = "1:1",
  label,
  progress,
  variant = "label",
  subscribed = false,
  targetRoute,
  hasNextLevel,
  showRightIcon,
  className = "",
  ...props
}: ShowCardProps) {
  const progressValue = typeof progress === "number" ? progress : 80;
  const hasImage = Boolean(imageSrc);
  const shouldShowRightIcon = showRightIcon ?? hasNextLevel ?? (targetRoute === undefined ? true : Boolean(targetRoute));

  return (
    <button
      type="button"
      className={cx(
        "gt-wiki-show-card",
        `gt-wiki-show-card--${variant}`,
        hasImage && `gt-wiki-show-card--image-${imageRatio.replace(":", "-")}`,
        hasImage ? "" : "gt-wiki-show-card--no-image",
        shouldShowRightIcon ? "" : "gt-wiki-show-card--no-arrow",
        className,
      )}
      {...props}
    >
      {hasImage ? <ImageFrame ratio={imageRatio} src={imageSrc} alt="" /> : null}
      {variant === "process" ? (
        <span className="gt-wiki-show-card__progress">
          <span className="gt-wiki-show-card__progress-top">
            <span className="gt-wiki-show-card__title">{title}</span>
            <span className="gt-wiki-show-card__progress-value">{progressValue}%</span>
          </span>
          <ProgressBar value={progressValue} className="gt-wiki-show-card__progress-bar" />
          {description ? (
            <ToolTip content={description}>
              <span className="gt-wiki-show-card__description">{description}</span>
            </ToolTip>
          ) : null}
        </span>
      ) : (
        <span className="gt-wiki-show-card__content">
          <span className="gt-wiki-show-card__title">{title}</span>
          {description ? (
            <ToolTip content={description}>
              <span className="gt-wiki-show-card__description">{description}</span>
            </ToolTip>
          ) : null}
        </span>
      )}
      {label ? <Badge tone={subscribed ? "success" : "neutral"}>{label}</Badge> : null}
      {shouldShowRightIcon ? <RemixIcon name="arrow-right-s-line" size={20} className="gt-wiki-show-card__arrow" /> : null}
    </button>
  );
}
