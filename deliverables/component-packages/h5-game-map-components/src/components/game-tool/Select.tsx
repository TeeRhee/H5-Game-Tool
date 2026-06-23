import { useId, useRef, useState } from "react";
import { DropdownCard } from "./DropdownCard";
import { DropdownOption } from "./DropdownOption";
import { RemixIcon } from "./RemixIcon";

export interface SelectOption {
  id: string;
  label: string;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}

export function Select({ options, value, placeholder = "选择地图", disabled = false, onChange }: SelectProps) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const selected = options.find((option) => option.id === value) ?? options[0];
  const listId = useId();
  const isDisabled = disabled || options.length <= 1;

  return (
    <div className="gt-select">
      <button
        ref={buttonRef}
        type="button"
        className={["gt-select__trigger", isDisabled ? "gt-select__trigger--disabled" : ""].join(" ")}
        aria-expanded={open}
        aria-controls={listId}
        disabled={isDisabled}
        onClick={() => {
          if (isDisabled) return;
          setOpen((current) => !current);
        }}
      >
        <span className="gt-select__label">{selected?.label ?? placeholder}</span>
        <RemixIcon name="arrow-down-s-line" size={16} className="gt-select__icon" />
      </button>
      {open && !isDisabled ? (
        <DropdownCard
          id={listId}
          className="gt-select__menu"
          onRequestClose={() => setOpen(false)}
          anchorRef={buttonRef}
        >
          {options.map((option) => (
            <DropdownOption
              key={option.id}
              label={option.label}
              selected={option.id === selected?.id}
              onClick={() => {
                onChange(option.id);
                setOpen(false);
              }}
            />
          ))}
        </DropdownCard>
      ) : null}
    </div>
  );
}
