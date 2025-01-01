import clsx from "clsx";

import { PropsWithClassName } from "../helper";

type Props = {
  horizontal?: boolean;
};
export function Divider(props: PropsWithClassName<Props>) {
  const { horizontal = false, className } = props;
  return (
    <div
      className={clsx(
        "bg-dividing flex-shrink-0",
        horizontal ? "h-1" : "w-1",
        className
      )}
    ></div>
  );
}
