import {
  isValidNumber,
  deleteDecimalZero,
  toCardNum,
} from "@/lib/utils/number";
import { TEN_THOUSAND } from "@/lib/utils/number/const";
import clsx from "clsx";
import { ReactNode, useMemo } from "react";

interface RateNumProps {
  num?: number;
  className?: string;
  id?: string;
  notTrend?: boolean;
  withBrackets?: boolean;
  placeHolder?: ReactNode; // 数据无效时的占位
}

export function RateNum({
  num,
  className,
  id,
  notTrend = false,
  withBrackets = false,
  placeHolder,
}: RateNumProps) {
  const _num = useMemo(() => Math.ceil((num ?? 0) * 10000) / 100, [num]);
  return (
    <div
      className={clsx(className, {
        "text-red": !notTrend && _num < 0 && num,
        "text-green": !notTrend && _num > 0 && num,
        "text-text1": !notTrend && _num === 0 && (num || num === 0),
      })}
      id={id}
    >
      {withBrackets ? "(" : ""}
      {isValidNumber(num)
        ? `${!notTrend && _num > 0 ? "+" : ""}${deleteDecimalZero(
            toCardNum(_num, "", TEN_THOUSAND)
          )}%`
        : placeHolder ?? "--"}
      {withBrackets ? ")" : ""}
    </div>
  );
}
