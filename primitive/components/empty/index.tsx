import clsx from "clsx";
import { ReactNode } from "react";

export function Empty({
  label = "No Data",
  className,
}: {
  label?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "w-full min-h-0 h-full flex items-center justify-center",
        className
      )}
    >
      <div className='flex flex-col gap-16 items-center justify-center w-full'>
        <span className='text-[64px]'>💭</span>
        <div>{label}</div>
      </div>
    </div>
  );
}
