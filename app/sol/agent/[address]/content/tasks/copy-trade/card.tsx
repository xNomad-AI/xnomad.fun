import {
  Button,
  Card,
  IconDelete,
  IconEdit,
  message,
  Modal,
  ModalContent,
  ModalTitleWithBorder,
} from "@/primitive/components";
import {
  deleteCopyTradeTask,
  CopyTrade,
  setCopyTradeStatus,
  editCopyTrade,
} from "./network";
import { onError } from "@/lib/utils/error";
import { memo, useEffect, useState } from "react";
import { Address } from "@/components/address";
import { ConfirmModal } from "../../features/confirm";
import { BreathingLight } from "@/components/breathing-light";
import { format } from "date-fns";
import { CopyTradeForm } from "../../../chat/content/trade.tsx/copy-trade/form";
import { useAgentStore } from "../../../store";
import {
  CopyTradeFormType,
  initCopyTradeForm,
} from "../../../chat/content/trade.tsx/copy-trade";
import { useMemoizedFn } from "ahooks";

function MemoTaskCard({
  task,
  onDelete,
  agentId,
  onChangeStatus,
  onEdit,
}: {
  task: CopyTrade;
  agentId: string;
  onDelete?: () => void;
  onEdit?: () => void;
  onChangeStatus?: () => void;
}) {
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  return (
    <Card className='p-16 flex flex-col gap-16 w-full'>
      <div className='flex items-center gap-8'>
        <span className='text-size-16 font-bold'>{task.name}</span>
        <BreathingLight
          className='h-8 w-8'
          disabled={task.status === "paused"}
        />
      </div>
      <div className='flex flex-col gap-8'>
        <p>
          <span className='text-text2'>Created:</span>{" "}
          {format(task.createdAt, "yyyy/MM/dd")}
        </p>
        <p>
          <span className='text-text2'>Target:</span>{" "}
          <Address
            enableCopy
            className='inline-flex'
            address={task.targetAddress}
          />
        </p>
        <p>
          <span className='text-text2'>Buy per Trade:</span>{" "}
          {task.fixedAmount
            ? `${task.fixedAmount} SOL`
            : `${task.percentage ?? 0}%`}
        </p>
        <p>
          <span className='text-text2'>Copy Sell:</span>{" "}
          {task.copySell ? "Yes" : "No"}
        </p>
      </div>
      <div className='flex items-center gap-12'>
        <Button
          stretch
          loading={isChangingStatus}
          variant={task.status === "paused" ? "primary" : "secondary"}
          onClick={() => {
            setIsChangingStatus(true);
            setCopyTradeStatus(
              agentId,
              task.id,
              task.status === "paused" ? "running" : "paused"
            )
              .then(() => {
                message(
                  `Task has been ${
                    task.status === "paused" ? "started" : "stopped"
                  }`,
                  { type: "success" }
                );
                onChangeStatus?.();
              })
              .catch((e) => {
                onError(e);
              })
              .finally(() => {
                setIsChangingStatus(false);
              });
          }}
        >
          {task.status === "paused" ? "Start" : "Stop"}
        </Button>
        <EditButton onEdit={onEdit} task={task} agentId={agentId} />
        <CancelButton onDelete={onDelete} task={task} agentId={agentId} />
      </div>
    </Card>
  );
}
export const TaskCard = memo(MemoTaskCard, (prev, next) => {
  return (
    prev.task.id === next.task.id &&
    prev.task.status === next.task.status &&
    prev.task.name === next.task.name &&
    prev.task.targetAddress === next.task.targetAddress &&
    prev.task.fixedAmount === next.task.fixedAmount &&
    prev.task.percentage === next.task.percentage &&
    prev.task.copySell === next.task.copySell
  );
});

function CancelButton({
  onDelete,
  task,
  agentId,
}: {
  onDelete?: () => void;
  task: CopyTrade;
  agentId: string;
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        variant='secondary'
        className={"!p-0 !w-40 !h-40 flex-shrink-0"}
        onClick={() => {
          setOpen(true);
        }}
      >
        <IconDelete className='text-size-20 text-red' />
      </Button>
      <ConfirmModal
        title='Delete Copy Trade'
        content='Are you sure to delete the copy trade? After deletion, you can sell the holdings manually.'
        open={open}
        isConfirming={isDeleting}
        onClose={() => {
          setOpen(false);
        }}
        onConfirm={() => {
          setIsDeleting(true);
          deleteCopyTradeTask(task.id, agentId)
            .then(() => {
              message("Task has been canceled", { type: "success" });
              onDelete?.();
              setOpen(false);
            })
            .catch((e) => {
              onError(e);
            })
            .finally(() => {
              setIsDeleting(false);
            });
        }}
      />
    </>
  );
}

function EditButton({
  task,
  agentId,
  onEdit,
}: {
  task: CopyTrade;
  agentId: string;
  onEdit?: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);

  const [open, setOpen] = useState(false);
  const { nft } = useAgentStore();
  const [form, setForm] = useState<CopyTradeFormType>(initCopyTradeForm);
  const initForm = useMemoizedFn(() => {
    setForm({
      name: { ...form.name, value: task.name },
      mode: { ...form.mode, value: task.mode },
      amount: {
        ...form.amount,
        value:
          task.mode === "amount"
            ? task.fixedAmount?.toString() ?? ""
            : task.percentage?.toString() ?? "",
      },
      isCopySell: { ...form.isCopySell, value: task.copySell },
      target: { ...form.target, value: task.targetAddress },
    });
  });
  const onClose = useMemoizedFn(() => {
    setOpen(false);
  });
  useEffect(() => {
    initForm();
  }, [task]);
  return (
    <>
      <Button
        variant='secondary'
        className={"!p-0 !w-40 !h-40 flex-shrink-0"}
        onClick={() => {
          setOpen(true);
        }}
      >
        <IconEdit className='text-size-20 text-text1' />
      </Button>
      <Modal size='m' onMaskClick={onClose} open={open}>
        <ModalTitleWithBorder closable onClose={onClose}>
          Edit Copy Trade
        </ModalTitleWithBorder>
        <ModalContent>
          <CopyTradeForm
            form={form}
            type='edit'
            setForm={setForm}
            address={nft.agentAccount.solana}
          />
          <Button
            loading={isEditing}
            stretch
            onClick={() => {
              if (Object.values(form).some((item) => item.isInValid)) {
                return;
              }
              let allValid = true;
              const newForm = { ...form };
              Object.keys(newForm).forEach((_key) => {
                const key = _key as keyof typeof newForm;
                if (newForm[key].required) {
                  if (!newForm[key].value) {
                    allValid = false;
                    newForm[key].isInValid = true;
                    newForm[key].errorMsg = "Required";
                  }
                }
              });
              if (!allValid) {
                setForm(newForm);
                return;
              }
              setIsEditing(true);
              editCopyTrade(agentId, task.id, {
                ...task,
                name: form.name.value,
                mode: form.mode.value,
                targetAddress: form.target.value,
                fixedAmount:
                  form.mode.value === "amount"
                    ? parseFloat(form.amount.value)
                    : undefined,
                percentage:
                  form.mode.value === "percentage"
                    ? parseFloat(form.amount.value)
                    : undefined,
                copySell: form.isCopySell.value,
              })
                .then(() => {
                  message("Task has been updated", { type: "success" });
                  onEdit?.();
                  onClose();
                })
                .catch((e) => {
                  onError(e);
                })
                .finally(() => {
                  setIsEditing(false);
                });
            }}
          >
            Confirm
          </Button>
        </ModalContent>
      </Modal>
    </>
  );
}
