import clsx from "clsx";
import { PropsWithChildren, ReactNode, useMemo, useState } from "react";

import { IconArrowRight } from "../icon";
import { Icon } from "../icon/helper";

export interface CollapseProps {
  title: ReactNode;
  value?: boolean;
  defaultValue?: boolean;
  onChange?: (value: boolean) => void;
  extra?: Icon;
  className?: string;
  forceRender?: boolean;
}

export function Collapse(props: PropsWithChildren<CollapseProps>) {
  const {
    title,
    value,
    defaultValue = false,
    onChange,
    extra: Icon = IconArrowRight,
    className,
    forceRender,
  } = props;
  const [innerValue, setInnerValue] = useState(value ?? defaultValue);
  const handleClick = () => {
    onChange?.(!innerValue);
    setInnerValue(!innerValue);
  };
  const final = useMemo(
    () => value ?? forceRender ?? innerValue,
    [value, forceRender, innerValue]
  );
  return (
    <div>
      <div
        className={clsx(
          "flex items-center justify-between w-full cursor-pointer h-48",
          className
        )}
        onClick={handleClick}
      >
        <div className='shrink grow text-size-14 text-text1 select-none truncate font-bold'>
          {title}
        </div>
        <Icon
          className={clsx(
            final ? "rotate-90" : "rotate-0",
            "transition-transform ease-in-out duration-200 text-size-16"
          )}
        />
      </div>
      <div className={clsx("overflow-hidden", final ? "h-hit" : "h-0")}>
        <div>{final ? props.children : null}</div>
      </div>
    </div>
  );
}
