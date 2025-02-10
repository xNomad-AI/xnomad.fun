import BigNumber from "bignumber.js";
import clsx from "clsx";
import { ReactNode, useMemo } from "react";
import { dealSmallNumber } from "./utils";
import { dealCardTokenPrice } from "@/lib/utils/number";

export function TokenNumber({
  number: _number,
  suffix,
  prefix,
  ...rest
}: {
  number: number | string | BigNumber;
  suffix?: ReactNode;
  prefix?: ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) {
  const number = BigNumber(_number);
  const isSmallNumber = number.lt(0.001) && number.gt(0);
  const { decimal, nonZeroString } = useMemo(() => {
    if (!isSmallNumber) return { decimal: 0, nonZeroString: "" };
    return dealSmallNumber(number.toNumber());
  }, [_number]);
  return (
    <div
      {...rest}
      className={clsx("inline-flex items-center gap-4", rest.className)}
    >
      {prefix}
      <span className='text-inherit'>
        {isSmallNumber ? (
          <>
            0.0
            <sub className={clsx("text-inherit")}>{decimal - 1}</sub>
            {nonZeroString}
          </>
        ) : (
          dealCardTokenPrice(number.toString())
        )}
      </span>
      {suffix}
    </div>
  );
}
