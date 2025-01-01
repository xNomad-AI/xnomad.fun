import clsx from "clsx";
import { ProgressColor } from "./type";
import { colors } from "./style";

interface ProgressBarProps {
  value: number; // ratio
  color?: ProgressColor;
  className?: string;
}

export function ProgressBar(props: ProgressBarProps) {
  // 计算进度条的宽度
  const { value, color = "primary", className } = props;
  const width = Math.abs(value) > 100 ? 100 : Math.abs(value);

  return (
    <div
      className={clsx(
        "w-full rounded-full h-4 relative overflow-hidden",
        colors.background[color],
        className
      )}
    >
      <div
        style={{ width: `${width}%` }}
        className={clsx(
          "absolute top-0 left-0 bottom-0 rounded-full",
          colors.filler[color]
        )}
      ></div>
    </div>
  );
}
