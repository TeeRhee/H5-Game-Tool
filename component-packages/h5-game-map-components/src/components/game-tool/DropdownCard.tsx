import type { ReactNode, RefObject } from "react";
import { useEffect, useRef } from "react";

export interface DropdownCardProps {
  id?: string;
  children: ReactNode;
  className?: string;
  anchorRef?: RefObject<HTMLElement>;
  onRequestClose?: () => void;
}

export function DropdownCard({
  id,
  children,
  className = "",
  anchorRef,
  onRequestClose,
}: DropdownCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!onRequestClose) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (ref.current?.contains(target)) return;
      if (anchorRef?.current?.contains(target)) return;
      onRequestClose();
    };

    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, [anchorRef, onRequestClose]);

  return (
    <div id={id} ref={ref} className={["gt-dropdown-card", className].join(" ")} role="listbox">
      {children}
    </div>
  );
}

