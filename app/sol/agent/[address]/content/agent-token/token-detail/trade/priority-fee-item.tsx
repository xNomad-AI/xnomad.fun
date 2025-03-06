import clsx from "clsx";
import { ReactNode } from "react";

type Props = {
  active?: boolean;
  icon?: ReactNode;
  price?: ReactNode;
  speed?: number;
  onClick?: () => void;
};
export function PriorityFeeItem(props: Props) {
  const { active, icon, price, speed, onClick } = props;
  return (
    <button
      onClick={onClick}
      className={clsx(
        "flex h-24 items-center justify-center text-text2 text-size-12 gap-4 rounded-6 bg-surface",
        { "bg-background text-text1": active }
      )}
    >
      {icon}
      <span>
        {price}(~{speed}s)
      </span>
    </button>
  );
}
