import { beautifyTimeV2 } from "@/lib/utils/beautify-time";
import { useTimeStore } from "@/primitive/hooks/time";

export function AgeCell({ time }: { time: number | string }) {
  useTimeStore();
  return (
    <span>
      {beautifyTimeV2(new Date(time).getTime(), true, false, "", true)}
    </span>
  );
}
