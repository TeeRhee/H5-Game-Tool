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
  variant?: "label" | "process" | "voice";
  audioSrc?: string;
  currentTimeLabel?: string;
  durationLabel?: string;
  isPlaying?: boolean;
  subscribed?: boolean;
  targetRoute?: string;
  hasNextLevel?: boolean;
  showRightIcon?: boolean;
  interactive?: boolean;
}

export function ShowCard({
  title,
  description,
  imageSrc,
  imageRatio = "1:1",
  label,
  progress,
  variant = "label",
  audioSrc,
  currentTimeLabel = "0:00",
  durationLabel,
  isPlaying = false,
  subscribed = false,
  targetRoute,
  hasNextLevel,
  showRightIcon,
  interactive,
  className = "",
  disabled,
  onClick,
  ...props
}: ShowCardProps) {
  const progressValue = typeof progress === "number" ? progress : 80;
  const isVoice = variant === "voice";
  const hasImage = !isVoice && Boolean(imageSrc);
  const shouldShowRightIcon = isVoice ? false : (showRightIcon ?? hasNextLevel ?? (targetRoute === undefined ? true : Boolean(targetRoute)));
  const isInteractive = !disabled && (interactive ?? Boolean(onClick || targetRoute || hasNextLevel || (isVoice && audioSrc)));
  const shouldReserveActionColumn = isVoice || shouldShowRightIcon;
  const voiceProgressValue = Math.max(0, Math.min(100, typeof progress === "number" ? progress : 0));
  const voiceTimeLabel = `${currentTimeLabel}/${durationLabel ?? "0:00"}`;

  if (isVoice) {
    return (
      <button
        type="button"
        data-audio-src={audioSrc}
        className={cx("gt-wiki-show-card", "gt-wiki-show-card--voice", isInteractive && "gt-wiki-show-card--interactive", className)}
        disabled={disabled}
        onClick={onClick}
        {...props}
      >
        <RemixIcon
          name={isPlaying ? "pause-fill" : "play-fill"}
          size={24}
          className="gt-wiki-show-card__voice-icon"
        />
        <span className="gt-wiki-show-card__voice-content">
          <span className="gt-wiki-show-card__voice-top">
            <span className="gt-wiki-show-card__title">{title}</span>
            <span className="gt-wiki-show-card__voice-time">{voiceTimeLabel}</span>
          </span>
          <span className="gt-wiki-show-card__voice-track" aria-hidden="true">
            <span style={{ width: `${voiceProgressValue}%` }} />
          </span>
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      data-audio-src={audioSrc}
      className={cx(
        "gt-wiki-show-card",
        `gt-wiki-show-card--${variant}`,
        isInteractive && "gt-wiki-show-card--interactive",
        hasImage && `gt-wiki-show-card--image-${imageRatio.replace(":", "-")}`,
        hasImage ? "" : "gt-wiki-show-card--no-image",
        shouldReserveActionColumn ? "" : "gt-wiki-show-card--no-arrow",
        className,
      )}
      disabled={disabled}
      onClick={onClick}
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
      {isVoice ? (
        <RemixIcon
          name={isPlaying ? "pause-circle-line" : "play-circle-line"}
          size={20}
          className="gt-wiki-show-card__voice-icon"
        />
      ) : null}
      {shouldShowRightIcon ? <RemixIcon name="arrow-right-s-line" size={20} className="gt-wiki-show-card__arrow" /> : null}
    </button>
  );
}
