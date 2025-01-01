import clsx from "clsx";
import {
  DetailedHTMLProps,
  forwardRef,
  HTMLAttributes,
  ReactNode,
} from "react";

type IconWrapperProps = DetailedHTMLProps<
  HTMLAttributes<HTMLSpanElement>,
  HTMLSpanElement
>;

export type Icon = ReturnType<
  typeof forwardRef<HTMLSpanElement, IconWrapperProps>
>;

export function createSingleColorIcon(Icon: ReactNode, shrink = false): Icon {
  return forwardRef<HTMLSpanElement, IconWrapperProps>(function IconWrapper(
    props,
    ref
  ) {
    const { className, ...raw } = props;

    return (
      <span
        className={clsx(
          "[&_svg]:text-inherit [&_svg_path]:fill-current block",
          "[&_svg]:h-[1em] h-[1em]",
          shrink ? "w-[0.6em] [&_svg]:w-[0.6em]" : `[&_svg]:w-[1em] w-[1em]`,
          className
        )}
        ref={ref}
        {...raw}
      >
        {Icon}
      </span>
    );
  });
}

export function createBaseIcon(Icon: ReactNode): Icon {
  return forwardRef<HTMLSpanElement, IconWrapperProps>(function IconWrapper(
    props,
    ref
  ) {
    const { className, ...raw } = props;

    return (
      <span
        className={clsx(
          "[&_svg]:h-[1em] h-[1em] [&_svg]:w-[1em] w-[1em]",
          className
        )}
        ref={ref}
        {...raw}
      >
        {Icon}
      </span>
    );
  });
}
