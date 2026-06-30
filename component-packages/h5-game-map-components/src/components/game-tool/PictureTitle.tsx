export interface PictureTitleProps {
  title?: string;
  imageSrc?: string;
  logoSrc?: string;
}

export function PictureTitle({ title = "游戏 Logo", imageSrc, logoSrc }: PictureTitleProps) {
  const src = logoSrc ?? imageSrc;

  return (
    <section className="gt-picture-title" aria-label={title}>
      <div className="gt-picture-title__logo-slot">
        {src ? <img src={src} alt={title} className="gt-picture-title__image" /> : null}
      </div>
    </section>
  );
}
