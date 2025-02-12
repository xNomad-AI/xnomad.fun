import clsx from "clsx";
import { PropsWithChildren } from "react";

import { PropsWithClassName } from "../helper";

type Props = {
  handleSelect?: () => void;
  selected: boolean;
  reverse?: boolean;
};

export function SelectOption(
  props: PropsWithChildren<PropsWithClassName<Props>>
) {
  const { className, children, handleSelect, selected, reverse } = props;

  return (
    <div
      className={clsx(
        "rounded-4 h-40 cursor-pointer flex-shrink-0 flex items-center px-12 whitespace-pre  gap-8 ",
        reverse
          ? "not-mobile:hover:bg-background aria-selected:bg-background"
          : "not-mobile:hover:bg-surface aria-selected:bg-surface",
        className
      )}
      aria-selected={selected}
      onClick={() => {
        handleSelect?.();
      }}
    >
      {children}
    </div>
  );
}
