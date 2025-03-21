import { PropsWithChildren, ReactNode, useMemo, useState } from "react";
import { Card } from ".";
import clsx from "clsx";
import { IconArrowDown, IconArrowLeft } from "../icon";

export function CollapseCard({
  open,
  onChange,
  children,
  title,
  className,
}: PropsWithChildren<{
  open?: boolean;
  onChange?: (open: boolean) => void;
  title: ((open: boolean) => ReactNode) | ReactNode;
  className?: string;
}>) {
  const [isFolded, setIsFolded] = useState(false);
  const isOpen = useMemo(() => open ?? !isFolded, [open, isFolded]);
  return (
    <Card
      className={clsx(
        "flex flex-col transition-all duration-300 ease-in-out",
        className
      )}
    >
      <div
        className='w-full cursor-pointer'
        onClick={() => {
          setIsFolded(!isFolded);
          onChange?.(!open);
        }}
      >
        {typeof title === "function" ? (
          title(isOpen)
        ) : (
          <div className='w-full flex justify-between p-16 cursor-pointer'>
            {title}
            <IconArrowDown
              className={clsx(
                "text-size-20 transition-all duration-300 ease-in-out",
                {
                  "rotate-180": isOpen,
                }
              )}
            />
          </div>
        )}
      </div>
      <div
        className={clsx(
          "w-full flex flex-col gap-16 p-16 -mt-16 transition-all duration-300 ease-in-out",
          {
            "max-h-0 opacity-0 pointer-events-none overflow-hidden absolute":
              isFolded,
          }
        )}
      >
        {isOpen ? children : null}
      </div>
    </Card>
  );
}
