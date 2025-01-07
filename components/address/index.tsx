import { IconFileCopy, Tooltip } from "@/primitive/components";
import { copy } from "@/primitive/utils/copy";
import clsx from "clsx";

export function Address({
  address,
  enableCopy,
  className,
}: {
  address: string;
  enableCopy?: boolean;
  className?: string;
}) {
  return (
    <Tooltip
      content={address}
      className={clsx("flex items-center gap-8", className)}
    >
      <span>
        {address.slice(0, 4)}...{address.slice(-4)}
      </span>
      {enableCopy && (
        <IconFileCopy
          onClick={() => {
            copy(address);
          }}
          className='cursor-pointer text-inherit'
        />
      )}
    </Tooltip>
  );
}
