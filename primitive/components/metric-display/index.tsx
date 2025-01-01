import clsx from "clsx";
import { PropsWithChildren, ReactNode } from "react";

type Props = {
  name: ReactNode;
  reverse?: boolean;
};
export function MetricDisplay(props: PropsWithChildren<Props>) {
  return (
    <div
      className={clsx("flex", props.reverse ? "flex-col-reverse" : " flex-col")}
    >
      <div className='font-bold text-size-20'>{props.children}</div>
      <div className='text-text2'>{props.name}</div>
    </div>
  );
}
