import clsx from "clsx";
import { ButtonHTMLAttributes, DetailedHTMLProps, forwardRef } from "react";

import { IconLoading } from "../icon";
import { Icon } from "../icon/helper";
import { InteractiveBox } from "../interactive-box";
import { useButtonGroup } from "./group-context";
import { style } from "./style";
import { ButtonSize, ButtonVariant } from "./type";

type ButtonProps = {
  loading?: boolean;
  stretch?: boolean;
  size?: ButtonSize;
  variant?: ButtonVariant;
  spinner?: Icon;
  prefixNode?: React.ReactNode;
  suffixNode?: React.ReactNode;
  square?: boolean;
  static?: boolean;
} & DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(props, ref) {
    const {
      children,
      className,
      disabled = false,
      stretch = false,
      spinner: Spinner = IconLoading,
      prefixNode = null,
      suffixNode = null,
      variant = "primary",
      loading = false,
      size = "m",
      square = false,
      onClick,
      ...raw
    } = props;

    const group = useButtonGroup();

    const role = group.inGroup ? "button-group-item" : "button";

    return (
      <InteractiveBox
        as='button'
        ref={ref}
        data-role={role}
        data-square={square ? "square" : undefined}
        aria-roledescription={role}
        disabled={disabled || loading}
        aria-disabled={disabled}
        onClick={(e: any) => {
          if (!disabled && !loading) {
            onClick?.(e);
          }
        }}
        className={clsx(
          "gap-4 flex items-center justify-center font-bold select-none overflow-hidden flex-nowrap",
          style.size[group.inGroup ? group.size : size],
          style.rounded[group.inGroup ? group.size : size],
          style.variant[variant],
          stretch ? "w-full" : "w-fit",
          { "!cursor-not-allowed": disabled || loading },
          "data-[square=square]:!aspect-square data-[square=square]:!px-0 data-[square=square]:!shrink-0 data-[square=square]:!grow-0",
          className
        )}
        {...raw}
      >
        {loading ? (
          <Spinner className='animate-spin origin-center' />
        ) : (
          prefixNode
        )}
        {children}
        {suffixNode}
      </InteractiveBox>
    );
  }
);
