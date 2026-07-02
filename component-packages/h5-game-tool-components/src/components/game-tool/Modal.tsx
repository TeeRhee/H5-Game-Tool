import { useId, type CSSProperties, type HTMLAttributes, type ReactNode } from "react";
import { ImageFrame } from "./ImageFrame";
import { RemixIcon } from "./RemixIcon";
import { cx } from "./wikiUtils";

export type ModalMode = "fixed" | "inline";
export type ModalVariant = "detail" | "video";

export interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  variant?: ModalVariant;
  title?: string;
  subtitle?: string;
  description?: ReactNode;
  imageSrc?: string;
  imageAlt?: string;
  videoSrc?: string;
  posterSrc?: string;
  videoTitle?: string;
  videoControls?: boolean;
  autoPlay?: boolean;
  muted?: boolean;
  onClose?: () => void;
  closeLabel?: string;
  ariaLabel?: string;
  maxHeight?: number | string;
  descriptionMaxHeight?: number | string;
  mode?: ModalMode;
  showOverlay?: boolean;
}

function toCssLength(value: number | string) {
  return typeof value === "number" ? `${value}px` : value;
}

export function Modal({
  open = true,
  variant = "detail",
  title,
  subtitle,
  description,
  imageSrc,
  imageAlt = "",
  videoSrc,
  posterSrc,
  videoTitle,
  videoControls = true,
  autoPlay = false,
  muted = false,
  onClose,
  closeLabel = "Close modal",
  ariaLabel,
  maxHeight,
  descriptionMaxHeight = 232,
  mode = "fixed",
  showOverlay = true,
  className = "",
  style,
  ...props
}: ModalProps) {
  const titleId = useId();
  const computedMaxHeight = maxHeight ?? (variant === "video" ? 290 : 460);
  const labelledBy = title ? titleId : undefined;
  const fallbackAriaLabel = ariaLabel ?? videoTitle ?? title ?? "Modal";

  if (!open) return null;

  return (
    <div
      className={cx("gt-modal-layer", `gt-modal-layer--${mode}`, className)}
      style={{
        "--gt-modal-max-height": toCssLength(computedMaxHeight),
        "--gt-modal-description-max-height": toCssLength(descriptionMaxHeight),
        ...style,
      } as CSSProperties}
      {...props}
    >
      {showOverlay ? <div className="gt-modal-layer__overlay" aria-hidden="true" /> : null}
      <section
        className={cx("gt-modal", `gt-modal--${variant}`)}
        role="dialog"
        aria-modal={mode === "fixed" ? "true" : undefined}
        aria-labelledby={labelledBy}
        aria-label={labelledBy ? undefined : fallbackAriaLabel}
      >
        {onClose ? (
          <button className="gt-modal__close" type="button" aria-label={closeLabel} onClick={onClose}>
            <RemixIcon name="close-line" size={20} />
          </button>
        ) : null}
        {variant === "video" ? (
          <div className="gt-modal__video-frame">
            {videoSrc ? (
              <video className="gt-modal__video" src={videoSrc} poster={posterSrc} controls={videoControls} autoPlay={autoPlay} muted={muted} title={videoTitle} />
            ) : posterSrc ? (
              <img className="gt-modal__video-poster" src={posterSrc} alt={videoTitle ?? ""} />
            ) : null}
            <span className="gt-modal__play" aria-hidden="true">
              <RemixIcon name="play-fill" size={34} />
            </span>
          </div>
        ) : (
          <>
            {imageSrc ? <ImageFrame className="gt-modal__image" ratio="1:1" src={imageSrc} alt={imageAlt} /> : null}
            {title || subtitle ? (
              <div className="gt-modal__summary">
                {title ? (
                  <h2 id={titleId} className="gt-modal__title">
                    {title}
                  </h2>
                ) : null}
                {subtitle ? <p className="gt-modal__subtitle">{subtitle}</p> : null}
              </div>
            ) : null}
            {description ? <div className="gt-modal__description">{description}</div> : null}
          </>
        )}
      </section>
    </div>
  );
}
