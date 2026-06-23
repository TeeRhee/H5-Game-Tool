export interface RemixIconProps {
  name: string;
  size?: number;
  className?: string;
  "aria-label"?: string;
}

export function RemixIcon({
  name,
  size = 16,
  className = "",
  "aria-label": ariaLabel,
}: RemixIconProps) {
  const normalizedName = name.startsWith("ri-") ? name : `ri-${name}`;

  return (
    <i
      className={[normalizedName, className].join(" ")}
      style={{ fontSize: size, lineHeight: 1 }}
      aria-hidden={ariaLabel ? undefined : "true"}
      aria-label={ariaLabel}
      role={ariaLabel ? "img" : undefined}
    />
  );
}

