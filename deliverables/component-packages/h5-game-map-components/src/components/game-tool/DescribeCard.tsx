import { RemixIcon } from "./RemixIcon";

export interface DescribeCardProps {
  title: string;
  description?: string;
  imageSrc?: string;
  open: boolean;
  onClose: () => void;
}

export function DescribeCard({
  title,
  description,
  imageSrc,
  open,
  onClose,
}: DescribeCardProps) {
  if (!open) return null;

  return (
    <aside
      className={[
        "gt-describe-card",
        imageSrc ? "gt-describe-card--has-image" : "gt-describe-card--no-image",
      ].join(" ")}
      aria-label="点位详情"
    >
      <button type="button" className="gt-describe-card__close" onClick={onClose} aria-label="关闭详情">
        <RemixIcon name="close-line" size={16} />
      </button>
      {imageSrc ? <img src={imageSrc} alt="" className="gt-describe-card__image" /> : null}
      <div className="gt-describe-card__body">
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
    </aside>
  );
}
