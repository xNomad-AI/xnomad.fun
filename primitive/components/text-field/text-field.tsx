import clsx from "clsx";
import {
  DetailedHTMLProps,
  forwardRef,
  InputHTMLAttributes,
  ReactNode,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

import { IconClose, IconSearch } from "../icon";
import { InteractiveBox } from "../interactive-box";
import { style, TextFieldVariant } from "./variant";

interface Props
  extends DetailedHTMLProps<
    InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > {
  searchable?: boolean;
  clearable?: boolean;
  prefixNode?: ReactNode;
  suffixNode?: ReactNode;
  variant?: TextFieldVariant;
  onClear?: () => void;
  inputClassName?: string;
}

export const TextField = forwardRef<HTMLInputElement, Props>(function TextField(
  props,
  ref
) {
  const {
    className,
    inputClassName,
    disabled,
    clearable,
    suffixNode,
    searchable,
    prefixNode,
    variant = "normal",
    onChange,
    onClear,
    ...raw
  } = props;

  const internalRef = useRef<HTMLInputElement | null>(null);
  const [clearVisible, setClearVisible] = useState(false);

  useImperativeHandle(ref, () => internalRef.current!, []);

  const handleClear = () => {
    const input = internalRef.current;

    if (input) {
      /**
       * 修改原生元素的值
       * https://stackoverflow.com/questions/23892547/what-is-the-best-way-to-trigger-onchange-event-in-react-js
       */
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value"
      )?.set;
      nativeInputValueSetter?.call(input, "");
      input.dispatchEvent(new Event("input", { bubbles: true }));
      onClear?.();
    }
  };

  return (
    <InteractiveBox
      as='label'
      static
      className={clsx(
        "flex items-center h-40 px-12 text-size-14 rounded-4 gap-8 text-text1 bg-surface border-1 min-w-0",
        style[variant],
        className,
        { "!opacity-40 !cursor-not-allowed": disabled }
      )}
    >
      {prefixNode}
      {searchable ? (
        <IconSearch className='text-size-16 cursor-pointer' />
      ) : null}
      <input
        className={clsx(
          "bg-inherit border-none outline-none placeholder:text-text2 grow shrink min-w-0",
          inputClassName,
          {
            "!cursor-not-allowed": disabled,
          }
        )}
        ref={internalRef}
        type='text'
        size={1}
        aria-disabled={disabled}
        disabled={disabled}
        onChange={(e) => {
          if (e.target.value.length > 1) {
            setClearVisible(true);
          } else {
            setClearVisible(false);
          }
          onChange?.(e);
        }}
        {...raw}
      />
      {clearable && clearVisible ? (
        <IconClose
          className='text-size-16 cursor-pointer'
          onClick={handleClear}
        />
      ) : null}
      {suffixNode}
    </InteractiveBox>
  );
});
