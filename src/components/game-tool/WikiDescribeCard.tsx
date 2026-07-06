import type { HTMLAttributes, MouseEventHandler } from "react";
import { Badge, type BadgeTone, type BadgeVariant } from "./Badge";
import { ImageFrame, type ImageRatio } from "./ImageFrame";
import { ToolTip } from "./ToolTip";
import { cx } from "./wikiUtils";

export interface WikiDescribeCardBadgeItem {
  label: string;
  tone?: BadgeTone;
  variant?: BadgeVariant;
  decrementLabel?: string;
  incrementLabel?: string;
  decrementDisabled?: boolean;
  incrementDisabled?: boolean;
  onDecrement?: MouseEventHandler<HTMLButtonElement>;
  onIncrement?: MouseEventHandler<HTMLButtonElement>;
}

type WikiDescribeCardBadgeValue = string | WikiDescribeCardBadgeItem;

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
  showBadgeGroup?: boolean;
  showAttributes?: boolean;
  badge?: WikiDescribeCardBadgeValue;
  badges?: string[];
  badgeGroup?: WikiDescribeCardBadgeValue[];
  meta?: string[];
  attributes?: Array<{ label: string; value: string }>;
  interactive?: boolean;
}

function normalizeBadgeItem(item: WikiDescribeCardBadgeValue, fallbackTone: BadgeTone = "neutral"): WikiDescribeCardBadgeItem {
  if (typeof item === "string") {
    return { label: item, tone: fallbackTone };
  }

  return {
    tone: fallbackTone,
    ...item,
  };
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
  showBadgeGroup = true,
  showAttributes = true,
  badge,
  badges = [],
  badgeGroup = [],
  meta,
  attributes = [],
  interactive,
  className = "",
  ...props
}: WikiDescribeCardProps) {
  const titleBadge = badge ? normalizeBadgeItem(badge) : badges[0] ? normalizeBadgeItem(badges[0]) : null;
  const badgeGroupItems = badgeGroup.map((item) => normalizeBadgeItem(item, "info"));
  const metaItems = meta ?? attributes.map((item) => item.value || item.label).filter(Boolean);
  const hasAttributes = showAttributes && metaItems.length > 0;
  const hasTitle = showTitle && Boolean(title);
  const hasBadge = showBadge && Boolean(titleBadge?.label);
  const hasBadgeGroup = showBadgeGroup && badgeGroupItems.length > 0;
  const hasDescription = showDescription && Boolean(description);
  const hasContent = hasTitle || hasBadge || hasDescription;
  const hasBody = hasContent || hasBadgeGroup || hasAttributes;
  const isInteractive = interactive ?? Boolean(props.onClick || props.role === "button" || props.tabIndex != null);

  return (
    <article
      className={cx(
        "gt-wiki-describe-card",
        `gt-wiki-describe-card--${size}`,
        isInteractive && "gt-wiki-describe-card--interactive",
        isInteractive && state === "hover" && "gt-wiki-describe-card--hover",
        showImage && `gt-wiki-describe-card--image-${imageRatio.replace(":", "-")}`,
        hasAttributes ? "" : "gt-wiki-describe-card--no-attributes",
        hasDescription ? "" : "gt-wiki-describe-card--no-description",
        hasTitle ? "" : "gt-wiki-describe-card--no-title",
        hasBadgeGroup ? "" : "gt-wiki-describe-card--no-badge-group",
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
                  {hasBadge && titleBadge ? (
                    <Badge
                      tone={titleBadge.tone}
                      variant={titleBadge.variant}
                      decrementLabel={titleBadge.decrementLabel}
                      incrementLabel={titleBadge.incrementLabel}
                      decrementDisabled={titleBadge.decrementDisabled}
                      incrementDisabled={titleBadge.incrementDisabled}
                      onDecrement={titleBadge.onDecrement}
                      onIncrement={titleBadge.onIncrement}
                    >
                      {titleBadge.label}
                    </Badge>
                  ) : null}
                </div>
              ) : null}
              {hasDescription ? (
                <ToolTip content={description}>
                  <span className="gt-wiki-describe-card__description">{description}</span>
                </ToolTip>
              ) : null}
            </div>
          ) : null}
          {hasBadgeGroup ? (
            <div className="gt-wiki-describe-card__badge-group">
              {badgeGroupItems.map((item, index) => (
                <Badge
                  key={`${item.label}-${item.tone ?? "info"}-${index}`}
                  tone={item.tone}
                  variant={item.variant}
                  decrementLabel={item.decrementLabel}
                  incrementLabel={item.incrementLabel}
                  decrementDisabled={item.decrementDisabled}
                  incrementDisabled={item.incrementDisabled}
                  onDecrement={item.onDecrement}
                  onIncrement={item.onIncrement}
                >
                  {item.label}
                </Badge>
              ))}
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
