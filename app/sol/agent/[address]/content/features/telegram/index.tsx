import {
  Modal,
  ModalTitleWithBorder,
  ModalContent,
  FormItem,
  TextField,
  Button,
  FormValue,
  message,
} from "@/primitive/components";
import { Config } from "../types";
import { useEffect, useState } from "react";
import { onError } from "@/lib/utils/error";

export function TelegramModal({
  open,
  onClose,
  onSave,
  config,
}: {
  open: boolean;
  onClose: () => void;
  config?: Config;
  onSave: (config: Partial<Config>) => Promise<void>;
}) {
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSaving(false);
  }, [open]);
  const [botToken, setBotToken] = useState<FormValue<string>>({
    value: "",
    isInValid: false,
    errorMsg: "",
    required: true,
  });
  useEffect(() => {
    if (config) {
      setBotToken({
        value: config?.settings.secrets?.TELEGRAM_BOT_TOKEN || "",
        isInValid: false,
        errorMsg: "",
      });
    }
  }, [config]);
  return (
    <Modal open={open} size='m' onMaskClick={onClose}>
      <ModalTitleWithBorder closable onClose={onClose}>
        Telegram Integration
      </ModalTitleWithBorder>
      <ModalContent className='gap-16 max-h-[600px] overflow-auto pb-0'>
        <FormItem label='BOT TOKEN' {...botToken}>
          <TextField
            value={botToken.value}
            placeholder='Enter your telegram bot token'
            onChange={(e) => {
              setBotToken({
                value: e.target.value,
                isInValid: false,
                errorMsg: "",
              });
            }}
            variant={botToken.isInValid ? "error" : "normal"}
          />
        </FormItem>
        <div className='w-full flex items-center gap-16 sticky bottom-0 py-24 -mt-24 bg-background'>
          <Button variant='secondary' stretch onClick={onClose}>
            Cancel
          </Button>
          <Button
            loading={saving}
            stretch
            onClick={() => {
              if (botToken.isInValid) return;
              if (!botToken.value) {
                setBotToken({
                  value: botToken.value,
                  isInValid: true,
                  errorMsg: "This field is required",
                });
                return;
              }
              setSaving(true);
              onSave({
                settings: {
                  secrets: {
                    TELEGRAM_BOT_TOKEN: botToken.value,
                  },
                },
              })
                .then(() => {
                  message("Telegram integration updated successfully", {
                    type: "success",
                  });

                  setSaving(false);
                  onClose();
                })
                .catch((error) => {
                  onError(error);
                  setSaving(false);
                });
            }}
          >
            Save
          </Button>
        </div>
      </ModalContent>
    </Modal>
  );
}
