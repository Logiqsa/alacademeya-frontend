import { Children, isValidElement, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, LockKeyhole } from "lucide-react";

const optionsFromChildren = (children) =>
  Children.toArray(children).flatMap((child) => {
    if (!isValidElement(child)) return [];
    if (child.type === "option") {
      return [{
        value: String(child.props.value ?? ""),
        label: child.props.children,
        disabled: Boolean(child.props.disabled),
      }];
    }
    return optionsFromChildren(child.props.children);
  });

const optionLabel = (option) =>
  typeof option.label === "string" || typeof option.label === "number"
    ? option.label
    : String(option.value);

export default function AppSelect({
  children,
  className = "",
  value,
  defaultValue,
  onChange,
  disabled = false,
  disabledMessage = "يرجى اختيار القائمة السابقة أولًا",
  name,
  dir = "rtl",
  ...props
}) {
  const options = useMemo(() => optionsFromChildren(children), [children]);
  const currentValue = String(value ?? defaultValue ?? "");
  const selected = options.find((option) => option.value === currentValue) || options[0];
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  const updatePosition = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPosition({ top: rect.bottom + 6, left: rect.left, width: rect.width });
  };

  useEffect(() => {
    if (!open) return undefined;
    updatePosition();
    const closeOnOutside = (event) => {
      if (!triggerRef.current?.contains(event.target) && !menuRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    document.addEventListener("pointerdown", closeOnOutside);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      document.removeEventListener("pointerdown", closeOnOutside);
    };
  }, [open]);

  const choose = (nextValue) => {
    if (nextValue === currentValue) return setOpen(false);
    onChange?.({ target: { value: nextValue, name }, currentTarget: { value: nextValue, name } });
    setOpen(false);
  };

  const move = (direction) => {
    const enabled = options.filter((option) => !option.disabled);
    const index = Math.max(0, enabled.findIndex((option) => option.value === currentValue));
    const next = enabled[(index + direction + enabled.length) % enabled.length];
    if (next) choose(next.value);
  };

  const onKeyDown = (event) => {
    if (disabled) return;
    if (["ArrowDown", "ArrowUp"].includes(event.key)) {
      event.preventDefault();
      if (!open) setOpen(true);
      else move(event.key === "ArrowDown" ? 1 : -1);
    } else if (["Enter", " "].includes(event.key)) {
      event.preventDefault();
      setOpen((current) => !current);
    } else if (event.key === "Escape") {
      setOpen(false);
    } else if (event.key === "Home") {
      event.preventDefault();
      const first = options.find((option) => !option.disabled);
      if (first) choose(first.value);
    } else if (event.key === "End") {
      event.preventDefault();
      const last = [...options].reverse().find((option) => !option.disabled);
      if (last) choose(last.value);
    }
  };

  return (
    <>
      {name && <input type="hidden" name={name} value={currentValue} />}
      <button
        {...props}
        ref={triggerRef}
        type="button"
        disabled={disabled}
        dir={dir}
        aria-haspopup="listbox"
        aria-expanded={open}
        title={disabled ? disabledMessage : props.title}
        onClick={() => !disabled && setOpen((current) => !current)}
        onKeyDown={onKeyDown}
        className={`${className} flex items-center justify-between gap-2 text-right ${
          disabled ? "!cursor-not-allowed !border-[#CBD5E1] !bg-[#EEF2F6] !text-[#98A2B3] !opacity-100" : ""
        }`}
      >
        <span className="min-w-0 flex-1 truncate">{disabled ? disabledMessage : selected ? optionLabel(selected) : "—"}</span>
        {disabled ? <LockKeyhole size={15} className="shrink-0" /> : <ChevronDown size={16} className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />}
      </button>
      {open && position && createPortal(
        <div
          ref={menuRef}
          role="listbox"
          dir={dir}
          className="fixed z-[2000] max-h-64 overflow-y-auto rounded-xl border border-[#D7E2F3] bg-white p-1.5 shadow-xl"
          style={position}
        >
          {options.map((option) => {
            const active = option.value === currentValue;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={active}
                disabled={option.disabled}
                onClick={() => choose(option.value)}
                className={`flex w-full items-center rounded-lg px-3 py-2.5 text-right text-sm transition-colors ${
                  active
                    ? "bg-[#123C91] font-semibold text-white"
                    : "text-[#344054] hover:bg-[#EAF1FF] hover:text-[#123C91]"
                } disabled:cursor-not-allowed disabled:text-[#98A2B3]`}
              >
                {optionLabel(option)}
              </button>
            );
          })}
        </div>,
        document.body,
      )}
    </>
  );
}
