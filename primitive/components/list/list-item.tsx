import clsx from "clsx";
import {
  DetailedHTMLProps,
  forwardRef,
  HTMLAttributes,
  ReactNode,
} from "react";

type Props = {
  checked?: boolean;
  suffixNode?: ReactNode;
  prefixNode?: ReactNode;
} & DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

export const ListItem = forwardRef<HTMLDivElement, Props>(function ListItem(
  props,
  ref
) {
  const { className, children, checked, suffixNode, prefixNode, ...raw } =
    props;

  return (
    <div
      className={clsx(
        "flex items-center justify-between h-40 w-full cursor-pointer px-12 gap-8 text-text1",
        checked ? "bg-surface" : "bg-background hover:bg-surface",
        className
      )}
      {...raw}
      ref={ref}
    >
      {prefixNode && (
        <div className='flex items-center gap-8 shrink'>{prefixNode}</div>
      )}
      <div className='flex items-center gap-8 min-w-0 grow shrink'>
        {children}
      </div>
      {suffixNode && (
        <div className='flex items-center gap-8 shrink'>{suffixNode}</div>
      )}
    </div>
  );
});
