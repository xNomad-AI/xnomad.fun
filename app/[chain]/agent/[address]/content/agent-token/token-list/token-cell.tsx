import { Address } from "@/components/address";
import {
  IconTwitterX,
  IconTelegram,
  IconWebsite,
} from "@/primitive/components";
import { TokenInfo } from "./network";
import { TextWithEllipsis } from "@/components/text-with-ellipsis";
import { IconEmptyCoin } from "@/primitive/components/icon/components/empty-coin";

export function TokenCell({
  item,
  variant = "normal",
}: {
  item: TokenInfo;
  variant?: "normal" | "simple";
}) {
  return (
    <div className='flex w-full gap-4 items-center'>
      {item.logo ? (
        <img
          height={32}
          width={32}
          className='w-32 h-32 aspect-square rounded-full flex-shrink-0 mobile:hidden'
          src={item.logo}
          alt=''
        />
      ) : (
        <IconEmptyCoin className='text-size-32' />
      )}
      <div className='flex flex-col gap-4 min-w-0'>
        <div className='flex items-end gap-4'>
          <span className='font-bold'>{item.symbol}</span>
          <TextWithEllipsis className='text-text2'>
            {item.name}
          </TextWithEllipsis>
        </div>
        <div className='flex items-center gap-4'>
          <Address
            address={item.address}
            enableCopy
            className='text-size-12 text-text2'
          />
          {item.twitter && variant !== "simple" && (
            <a
              href={item.twitter}
              target='_blank'
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <IconTwitterX className='text-size-12 text-text2 not-mobile:hover:text-text1' />
            </a>
          )}
          {item.telegram && variant !== "simple" && (
            <a
              href={item.telegram}
              target='_blank'
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <IconTelegram className='text-size-12 text-text2 not-mobile:hover:text-text1' />
            </a>
          )}
          {item.website && variant !== "simple" && (
            <a
              href={item.website}
              target='_blank'
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <IconWebsite className='text-size-12 text-text2 not-mobile:hover:text-text1' />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
