import { Card, Tooltip } from "@/primitive/components";
import { isBasicToken } from "./utils";
import { Activity, Token } from "./network";
import { TokenNumber } from "@/components/token-number";
import { Address } from "@/components/address";
import { ActionType } from "./types";
import BigNumber from "bignumber.js";
import { upperFirstLetter } from "@/lib/utils/string";

export function ActionTag({ type }: { type: ActionType }) {
  if (type === "buy" || type === "receive") {
    return (
      <div className='px-8 py-4 h-26 flex items-center bg-green-10 text-green rounded-4'>
        {upperFirstLetter(type)}
      </div>
    );
  } else if (type === "sell" || type === "transfer") {
    return (
      <div className='px-8 py-4 h-26 flex items-center bg-red-10 text-red rounded-4'>
        {upperFirstLetter(type)}
      </div>
    );
  } else {
    return (
      <div className='px-8 py-4 h-26 flex items-center bg-brand-10 text-brand rounded-4'>
        {upperFirstLetter(type)}
      </div>
    );
  }
}

export function ActionContent({
  data,
  type,
}: {
  data: Activity;
  type: ActionType;
}) {
  if (type === "buy" || type === "sell") {
    const toToken = data.quote.type_swap === "to" ? data.quote : data.base;
    const fromToken = data.quote.type_swap === "from" ? data.quote : data.base;
    return (
      <>
        <TokenItem
          data={type === "sell" ? fromToken : toToken}
          isRed={type === "sell"}
        />
        <span className='text-size-12 text-text2'>with</span>

        <TokenItem data={type === "sell" ? toToken : fromToken} />
      </>
    );
  } else if (type === "swap") {
    const toToken = data.quote.type_swap === "to" ? data.quote : data.base;
    const fromToken = data.quote.type_swap === "from" ? data.quote : data.base;
    return (
      <>
        <TokenItem data={toToken} isRed />
        <span className='text-size-12 text-text2'>to</span>
        <TokenItem data={fromToken} />
      </>
    );
  } else {
    return (
      <>
        <TokenItem data={data.quote} isRed={type === "transfer"} noPrice />
        <span className='text-size-12 text-text2'>
          {type === "receive" ? "from" : "to"}
        </span>
        <Address address={type === "receive" ? data.source : data.address} />
      </>
    );
  }
}

export function TokenItem({
  data,
  isRed,
  noPrice,
}: {
  data: Token;
  isRed?: boolean;
  noPrice?: boolean;
}) {
  const isBaseToken = isBasicToken(data.symbol);
  return (
    <>
      <TokenNumber number={data.ui_amount} />
      <div className='flex items-center gap-4'>
        <Tooltip disabled={!data.address} content={data.address}>
          <span
            className={isBaseToken ? "" : isRed ? "text-red" : "text-green"}
          >
            {data.symbol ?? "Unknown"}
          </span>
        </Tooltip>
        {!noPrice && (
          <span className='text-text2'>
            (
            <TokenNumber
              prefix={"$"}
              number={
                isBaseToken
                  ? BigNumber(data.ui_amount).multipliedBy(
                      data.price || data.nearest_price
                    )
                  : data.price || data.nearest_price
              }
            />
            )
          </span>
        )}
      </div>
    </>
  );
}

export function Skeleton() {
  return (
    <Card className='p-16 flex items-center gap-8 bg-surface w-full h-60'>
      <div className='w-32 h-32 bg-background rounded-full'></div>
      <div className='w-[200px] h-32 bg-background rounded-8'></div>
      <div className='flex-1'></div>
      <div className='w-[98px] h-32 bg-background rounded-8'></div>
    </Card>
  );
}
