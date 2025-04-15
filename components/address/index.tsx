import { IconFileCopy, Tooltip } from "@/primitive/components";
import { copy } from "@/primitive/utils/copy";
import clsx from "clsx";
import { TextWithEllipsis } from "../text-with-ellipsis";

export function Address({
  address,
  enableCopy,
  className,
  disableTooltip,
  wholeAddress,
}: {
  address: string;
  enableCopy?: boolean;
  className?: string;
  disableTooltip?: boolean;
  wholeAddress?: boolean;
}) {
  return (
    <Tooltip
      disabled={disableTooltip || wholeAddress}
      content={address}
      contentClassName='break-all'
      className={clsx("flex items-center gap-8 min-w-0", className)}
    >
      {!address ? (
        "--"
      ) : wholeAddress ? (
        <TextWithEllipsis>{address}</TextWithEllipsis>
      ) : (
        <span>
          {address.slice(0, 4)}...{address.slice(-4)}
        </span>
      )}
      {enableCopy && Boolean(address) && (
        <IconFileCopy
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            copy(address);
          }}
          className='cursor-pointer text-inherit not-mobile:hover:text-text1'
        />
      )}
    </Tooltip>
  );
}
