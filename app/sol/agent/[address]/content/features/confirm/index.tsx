import {
  Button,
  Modal,
  ModalContent,
  ModalTitleWithBorder,
} from "@/primitive/components";
import { ReactNode } from "react";

export function ConfirmModal({
  title,
  content,
  onClose,
  onConfirm,
  open,
  isConfirming,
}: {
  title: ReactNode;
  content: ReactNode;
  onConfirm: () => void;
  onClose: () => void;
  open: boolean;
  isConfirming: boolean;
}) {
  return (
    <Modal size='s' onMaskClick={onClose} open={open}>
      <ModalTitleWithBorder onClose={onClose} closable>
        {title}
      </ModalTitleWithBorder>
      <ModalContent>
        {content}
        <div className='w-full flex items-center justify-end gap-16'>
          <Button variant='secondary' onClick={onClose}>
            Cancel
          </Button>
          <Button variant='danger' onClick={onConfirm} loading={isConfirming}>
            Confirm
          </Button>
        </div>
      </ModalContent>
    </Modal>
  );
}
