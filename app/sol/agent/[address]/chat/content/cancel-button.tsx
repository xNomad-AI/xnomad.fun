import { Button } from "@/primitive/components";
import { ConfirmModal } from "../../content/features/confirm";
import { useState } from "react";

export function CancelButton({ onClick }: { onClick: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        size='s'
        variant='secondary'
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
