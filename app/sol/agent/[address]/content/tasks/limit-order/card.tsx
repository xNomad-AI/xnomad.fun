import { Button, Card, message } from "@/primitive/components";
import { deleteAutoTask, getAutoTasks, Task } from "./network";
import { TokenNumber } from "@/components/token-number";
import { beautifyTimeV2 } from "@/lib/utils/beautify-time";
import { onError } from "@/lib/utils/error";
import { upperFirstLetter } from "@/lib/utils/string";
import clsx from "clsx";
import { useState } from "react";

export function TaskCard({
  task,
  onDelete,
  agentId,
}: {
  task: Task;
  agentId: string;
  onDelete?: () => void;
}) {
  const type =
    task?.outputTokenSymbol?.toLowerCase() === "sol" ? "sell" : "buy";
  const [isDeleting, setIsDeleting] = useState(false);
  return (
    <Card className='p-16 flex items-center gap-8 flex-wrap'>
      <div className='flex flex-col gap-8 flex-1'>
        <div className='flex items-center gap-8'>
          <ActionTag type={type} />
          <TokenNumber number={task.amount} />
          <p
            className={clsx({
              "text-green": type === "buy",
              "text-red": type === "sell",
            })}
          >
            {type === "buy" ? task.outputTokenSymbol : task.inputTokenSymbol}
          </p>
        </div>
        <div className='flex items-center gap-8'>
          <span className='text-text2'>
            {upperFirstLetter(task.priceCondition)}:
          </span>
          <TokenNumber number={task.priceTarget} prefix={"$"} />
          <span className='text-text2 ml-8'>Expires:</span>
          <span>
            {beautifyTimeV2(new Date(task.expireAt).getTime(), true, false)}
          </span>
        </div>
      </div>
      <Button
        variant='secondary'
        loading={isDeleting}
        onClick={() => {
          setIsDeleting(true);
          deleteAutoTask(task.id, agentId)
            .then(() => {
              message("Task has been canceled", { type: "success" });
              onDelete?.();
            })
            .catch((e) => {
              onError(e);
            })
            .finally(() => {
              setIsDeleting(false);
            });
        }}
      >
        Cancel
      </Button>
    </Card>
  );
}
function ActionTag({ type }: { type: "sell" | "buy" }) {
  return (
    <div
      className={clsx("px-8 py-4 rounded-4 flex items-center", {
        "bg-red-10": type === "sell",
        "bg-green-10": type === "buy",
      })}
    >
      Limit {upperFirstLetter(type)}
    </div>
  );
}
