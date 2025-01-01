import clsx from "clsx";
import { PropsWithChildren } from "react";

import { PropsWithClassName } from "../helper";
import { useRadioButtonGroup } from "./context";
import { style } from "./style";

type Props<T> = {
  value: T;
  isIconButton?: boolean;
  width?: string;
  onSelect?: (value: T) => boolean; // return false to prevent change
  disabled?: boolean;
};

export function RadioButton<T extends string>(
  props: PropsWithChildren<PropsWithClassName<Props<T>>>
) {
  const {
    className,
    children,
    value,
    width: selfWidth,
    onSelect,
    isIconButton,
    disabled = false,
  } = props;
  const {
    value: activeValue,
    onChange,
    initialized,
    width,
    disableAnimation,
    variant,
  } = useRadioButtonGroup();
  const selected = activeValue === value;
  const handleClick = () => {
    if (!selected && onSelect?.(value) !== false) {
      onChange?.(value);
    }
  };

  return (
    <div
      className={clsx(
        "h-full flex items-center justify-center relative z-2 rounded-4 select-none",
        (disableAnimation && selected) || (selected && !initialized)
          ? style.item[variant]
          : "bg-transparent",
        selected ? "text-text1" : "text-text2",
        isIconButton ? "px-0" : "px-8",
        disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer ",
        className
      )}
      style={{
        width: selfWidth ?? width,
      }}
      role='radio-button'
      aria-label={value}
      onClick={handleClick}
    >
      {isIconButton ? (
        <div className='aspect-square flex items-center justify-center h-full'>
          {children}
        </div>
      ) : (
        children
      )}
    </div>
  );
}
