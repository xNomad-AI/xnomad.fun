import clsx from "clsx";
import { PropsWithChildren, ReactNode } from "react";
import { FormValue } from ".";

type Props = {
  label: ReactNode;
  horizontal?: boolean;
  className?: string;
};

export function FormItem<T>(props: PropsWithChildren<Props & FormValue<T>>) {
  return (
    <div
      className={clsx(
        "flex gap-8",
        props.horizontal ? "justify-between items-center" : " flex-col",
        props.className
      )}
    >
      <label>
        {props.label}
        {props.required && <span className='text-red'>&nbsp;*</span>}
      </label>
      {props.children}
      {props.isInValid && props.errorMsg && (
        <div className='text-red text-size-12'>{props.errorMsg}</div>
      )}
    </div>
  );
}
