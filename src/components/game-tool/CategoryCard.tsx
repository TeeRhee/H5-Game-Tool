import type { ButtonHTMLAttributes } from "react";
import { RemixIcon } from "./RemixIcon";
import { cx } from "./wikiUtils";

export interface CategoryCardProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  title: string;
  description?: string;
  imageSrc?: string;
  avatarSrcs?: string[];
  countLabel?: string;
  state?: "default" | "hover";
  meta?: string;
  interactive?: boolean;
}

export function CategoryCard({
  title,
  description,
  imageSrc,
  avatarSrcs,
  countLabel,
  state = "default",
  meta,
  interactive,
  className = "",
  disabled,
  onClick,
  ...props
}: CategoryCardProps) {
  const resolvedAvatarSrcs = (avatarSrcs && avatarSrcs.length > 0 ? avatarSrcs : imageSrc ? [imageSrc] : []).filter(Boolean).slice(0, 3);
  const resolvedCountLabel = countLabel ?? meta;
  const normalizedCountLabel = String(resolvedCountLabel ?? "").trim();
  const numericCount = Number(normalizedCountLabel.replace(/[^\d.-]/g, ""));

  if (normalizedCountLabel && Number.isFinite(numericCount) && numericCount === 0) return null;
  const isInteractive = !disabled && (interactive ?? Boolean(onClick));

  return (
    <button
      type="button"
      className={cx(
        "gt-wiki-category-card",
        isInteractive && "gt-wiki-category-card--interactive",
        isInteractive && state === "hover" && "gt-wiki-category-card--hover",
        className,
      )}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      <span className="gt-wiki-category-card__content">
        <span className="gt-wiki-category-card__header">
          <span className="gt-wiki-category-card__title">{title}</span>
          <span className="gt-wiki-category-card__arrow" aria-hidden="true">
            <RemixIcon name="arrow-right-s-line" size={20} />
          </span>
        </span>
        {description ? <span className="gt-wiki-category-card__description">{description}</span> : null}
      </span>
      <span className="gt-wiki-category-card__stats" aria-label={resolvedCountLabel ? `内容数量 ${resolvedCountLabel}` : undefined}>
        <span className="gt-wiki-category-card__avatars" aria-hidden="true">
          {resolvedAvatarSrcs.map((src, index) => (
            <span key={`${src}-${index}`} className={`gt-wiki-category-card__avatar gt-wiki-category-card__avatar--${index + 1}`}>
              <img src={src} alt="" />
            </span>
          ))}
        </span>
        {resolvedCountLabel ? <span className="gt-wiki-category-card__meta">{resolvedCountLabel}</span> : null}
      </span>
    </button>
  );
}
