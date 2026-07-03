import type { HTMLAttributes } from "react";
import { Badge } from "./Badge";
import { ImageFrame, type ImageRatio } from "./ImageFrame";
import { ToolTip } from "./ToolTip";
import { cx } from "./wikiUtils";

export interface WikiDescribeCardProps extends HTMLAttributes<HTMLElement> {
  title?: string;
  description?: string;
  imageSrc?: string;
  imageRatio?: ImageRatio;
  size?: "sm" | "lg";
  state?: "default" | "hover";
  showImage?: boolean;
  showTitle?: boolean;
  showDescription?: boolean;
  showBadge?: boolean;
  showAttributes?: boolean;
  badge?: string;
  badges?: string[];
  meta?: string[];
  attributes?: Array<{ label: string; value: string }>;
}

export function WikiDescribeCard({
  title,
  description,
  imageSrc,
  imageRatio = "1:1",
  size = "sm",
  state = "default",
  showImage = true,
  showTitle = true,
  showDescription = true,
  showBadge = true,
  showAttributes = true,
  badge,
  badges = [],
  meta,
  attributes = [],
  className = "",
  ...props
}: WikiDescribeCardProps) {
  const badgeText = badge ?? badges[0];
  const metaItems = meta ?? attributes.map((item) => item.value || item.label).filter(Boolean);
  const hasAttributes = showAttributes && metaItems.length > 0;
  const hasTitle = showTitle && Boolean(title);
  const hasBadge = showBadge && Boolean(badgeText);
  const hasDescription = showDescription && Boolean(description);
  const hasContent = hasTitle || hasBadge || hasDescription;
  const hasBody = hasContent || hasAttributes;

  return (
    <article
      className={cx(
        "gt-wiki-describe-card",
        `gt-wiki-describe-card--${size}`,
        `gt-wiki-describe-card--${state}`,
        showImage && `gt-wiki-describe-card--image-${imageRatio.replace(":", "-")}`,
        hasAttributes ? "" : "gt-wiki-describe-card--no-attributes",
        hasDescription ? "" : "gt-wiki-describe-card--no-description",
        hasTitle ? "" : "gt-wiki-describe-card--no-title",
        hasContent ? "" : "gt-wiki-describe-card--no-content",
        className,
      )}
      {...props}
    >
      {showImage ? <ImageFrame className="gt-wiki-describe-card__image" ratio={imageRatio} src={imageSrc} alt="" /> : null}
      {hasBody ? (
        <div className="gt-wiki-describe-card__body">
          {hasContent ? (
            <div className="gt-wiki-describe-card__content">
              {hasTitle || hasBadge ? (
                <div className="gt-wiki-describe-card__title-row">
                  {hasTitle ? <h3>{title}</h3> : null}
                  {hasBadge ? <Badge>{badgeText}</Badge> : null}
                </div>
              ) : null}
              {hasDescription ? (
                <ToolTip content={description}>
                  <span className="gt-wiki-describe-card__description">{description}</span>
                </ToolTip>
              ) : null}
            </div>
          ) : null}
          {hasAttributes ? (
            <div className="gt-wiki-describe-card__attributes">
              {metaItems.slice(0, size === "sm" ? 3 : 1).map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
