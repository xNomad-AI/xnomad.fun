import { Button, Card, message, Tooltip } from "@/primitive/components";
import { deleteAutoTask, Task } from "./network";
import { TokenNumber } from "@/components/token-number";
import { onError } from "@/lib/utils/error";
import { upperFirstLetter } from "@/lib/utils/string";
import clsx from "clsx";
import { memo, useMemo, useState } from "react";
import { Address } from "@/components/address";
import { ConfirmModal } from "../../features/confirm";
import { AgeCell } from "../../agent-token/token-list/age-cell";
import { getCurrencySymbol } from "@/app/layout/chain-provider/utils";
import { useChainStore } from "@/app/layout/chain-provider";

function MemoTaskCard({
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
          <AgeCell time={task.expireAt} />
        </div>
      </div>
      <CancelButton
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
      />
    </Card>
  );
}
export const TaskCard = memo(MemoTaskCard, (prev, next) => {
  return prev.task.id === next.task.id;
});
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
  const { chain } = useChainStore();
  if (type === "sell") {
    const displayToken = {
      symbol: task.inputTokenSymbol,
      ca: task.inputTokenCA,
      amount: task.inputTokenAmount,
    };
    return (
      <>
        <TokenNumber number={displayToken.amount ?? ""} />
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
      amount: task.outputTokenAmount,
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
        <TokenNumber number={task.inputTokenAmount ?? ""} />
        {task.inputTokenSymbol ?? getCurrencySymbol(chain)}
      </>
    );
  }
}

function CancelButton({
  onClick,
  loading,
}: {
  onClick: () => void;
  loading: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        variant='secondary'
        loading={loading}
        onClick={() => {
          setOpen(true);
        }}
      >
        Cancel
      </Button>
      <ConfirmModal
        title='Cancel Task'
        content='Are you sure to cancel the task?'
        open={open}
        onClose={() => {
          setOpen(false);
        }}
        onConfirm={() => {
          setOpen(false);
          onClick();
        }}
      />
    </>
  );
}
