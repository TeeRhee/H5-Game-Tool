import { RemixIcon } from "./RemixIcon";

export interface PopupDescribeCardProps {
  title: string;
  description?: string;
  imageSrc?: string;
  open: boolean;
  onClose: () => void;
}

export function PopupDescribeCard({
  title,
  description,
  imageSrc,
  open,
  onClose,
}: PopupDescribeCardProps) {
  if (!open) return null;

  return (
    <aside className={["gt-popup-describe-card", imageSrc ? "gt-popup-describe-card--has-image" : "gt-popup-describe-card--no-image"].join(" ")} aria-label="点位详情">
      <div className="gt-popup-describe-card__content">
        <div className="gt-popup-describe-card__header">
          <h2>{title}</h2>
          <button type="button" className="gt-popup-describe-card__close" onClick={onClose} aria-label="关闭详情">
            <RemixIcon name="close-line" size={20} />
          </button>
        </div>
        {imageSrc ? (
          <div className="gt-popup-describe-card__media">
            <img src={imageSrc} alt="" className="gt-popup-describe-card__image" />
          </div>
        ) : null}
        {description ? <p>{description}</p> : null}
      </div>
    </aside>
  );
}
