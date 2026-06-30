import type { HTMLAttributes } from "react";
import { RemixIcon } from "./RemixIcon";
import { cx } from "./wikiUtils";

export interface ImageFrameProps extends HTMLAttributes<HTMLDivElement> {
  ratio?: "1:1" | "3:2" | "16:9";
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
