import type { HTMLAttributes } from "react";
import { RemixIcon } from "./RemixIcon";
import { cx } from "./wikiUtils";

export type ImageRatio = "1:1" | "3:2" | "4:5" | "16:9";

export interface ImageFrameProps extends HTMLAttributes<HTMLDivElement> {
  ratio?: ImageRatio;
  src?: string;
  alt?: string;
}

export function ImageFrame({ ratio = "1:1", src, alt = "", className = "", children, ...props }: ImageFrameProps) {
  return (
    <div className={cx("gt-wiki-image", `gt-wiki-image--${ratio.replace(":", "-")}`, className)} {...props}>
      {src ? <img src={src} alt={alt} /> : children ?? <RemixIcon name="image-line" size={22} />}
    </div>
  );
}
