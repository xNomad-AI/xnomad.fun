import { Button, Card, message, Tooltip } from "@/primitive/components";
import { deleteAutoTask, getAutoTasks, Task } from "./network";
import { TokenNumber } from "@/components/token-number";
import { beautifyTimeV2 } from "@/lib/utils/beautify-time";
import { onError } from "@/lib/utils/error";
import { upperFirstLetter } from "@/lib/utils/string";
import clsx from "clsx";
import { useMemo, useState } from "react";
import { Address } from "@/components/address";

export function TaskCard({
  task,
  onDelete,
  agentId,
}: {
  task: Task;
  agentId: string;
  onDelete?: () => void;
}) {
  const type = useMemo(() => {
    if (task.outputTokenSymbol) {
      return task?.outputTokenSymbol?.toLowerCase() === "sol" ? "sell" : "buy";
    } else {
      return task?.inputTokenSymbol?.toLowerCase() === "sol" ? "buy" : "sell";
    }
  }, [task]);

  const [isDeleting, setIsDeleting] = useState(false);
  return (
    <Card className='p-16 flex items-center gap-8 flex-wrap'>
      <div className='flex flex-col gap-8 flex-1'>
        <div className='flex items-center gap-8'>
          <ActionTag type={type} />
          <ActionContent type={type} task={task} />
        </div>
        <div className='flex items-center gap-8'>
          <p className='text-text2'>
            Trigger:&nbsp;
            <span className='text-text1'>
              {upperFirstLetter(task.priceCondition)}
            </span>
          </p>
          <TokenNumber number={task.priceTarget} prefix={"$"} />
          <span className='text-text2 ml-8'>Expire:</span>
          <span>
            {beautifyTimeV2(new Date(task.expireAt).getTime(), true, false, "")}
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
        "bg-red-10 text-red": type === "sell",
        "bg-green-10 text-green": type === "buy",
      })}
    >
      Limit {upperFirstLetter(type)}
    </div>
  );
}

function ActionContent({ type, task }: { type: "sell" | "buy"; task: Task }) {
  if (type === "sell") {
    const displayToken = {
      symbol: task.inputTokenSymbol,
      ca: task.inputTokenCA,
    };
    return (
      <>
        <TokenNumber number={task.amount} />
        {displayToken.symbol ? (
          <Tooltip content={displayToken.ca}>
            <p className={"text-red"}>${displayToken.symbol}</p>
          </Tooltip>
        ) : (
          <Address className={"text-red"} address={displayToken.ca} />
        )}
      </>
    );
  } else {
    const displayToken = {
      symbol: task.outputTokenSymbol,
      ca: task.outputTokenCA,
    };
    return (
      <>
        {displayToken.symbol && displayToken.symbol !== displayToken.ca ? (
          <Tooltip content={displayToken.ca}>
            <p className={"text-green"}>{displayToken.symbol}</p>
          </Tooltip>
        ) : (
          <Address className={"text-green"} address={displayToken.ca} />
        )}
        <span className='text-text2'>with</span>
        <TokenNumber number={task.amount} />
        SOL
      </>
    );
  }
}
