import type { HTMLAttributes } from "react";
import { Badge } from "./Badge";
import { ImageFrame } from "./ImageFrame";
import { cx } from "./wikiUtils";

export interface WikiDescribeCardProps extends HTMLAttributes<HTMLElement> {
  title: string;
  description?: string;
  imageSrc?: string;
  size?: "sm" | "lg";
  state?: "default" | "hover";
  showImage?: boolean;
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
  size = "sm",
  state = "default",
  showImage = true,
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

  return (
    <article
      className={cx(
        "gt-wiki-describe-card",
        `gt-wiki-describe-card--${size}`,
        `gt-wiki-describe-card--${state}`,
        hasAttributes ? "" : "gt-wiki-describe-card--no-attributes",
        className,
      )}
      {...props}
    >
      {showImage ? <ImageFrame ratio="1:1" src={imageSrc} alt="" /> : null}
      <div className="gt-wiki-describe-card__body">
        <div className="gt-wiki-describe-card__content">
          <div className="gt-wiki-describe-card__title-row">
            <h3>{title}</h3>
            {showBadge && badgeText ? <Badge>{badgeText}</Badge> : null}
          </div>
          {description ? <p>{description}</p> : null}
        </div>
        {hasAttributes ? (
          <div className="gt-wiki-describe-card__attributes">
            {metaItems.slice(0, size === "sm" ? 3 : 1).map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}
