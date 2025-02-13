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
}: {
  title: ReactNode;
  content: ReactNode;
  onConfirm: () => void;
  onClose: () => void;
  open: boolean;
}) {
  return (
    <Modal size='s' onMaskClick={onClose} open={open}>
      <ModalTitleWithBorder onClose={onClose} closable>
        {title}
      </ModalTitleWithBorder>
      <ModalContent>
        {content}
        <div className='w-full flex items-center gap-16'>
          <Button variant='secondary' onClick={onClose}>
            Cancel
          </Button>
          <Button variant='danger' onClick={onConfirm}>
            Confirm
          </Button>
        </div>
      </ModalContent>
    </Modal>
  );
}
