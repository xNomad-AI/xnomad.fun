import {
  Button,
  Checkbox,
  FormItem,
  FormValue,
  IconInfo,
  Radio,
  RadioGroup,
  TextField,
  Tooltip,
} from "@/primitive/components";
import { useMemo, useState } from "react";
import { useChatContext } from "../../../store";
import { ChatContentContainer } from "../../container";
import { ContentWithUser } from "../../../types";
import { validNumberInput } from "@/lib/utils/input-helper";
import { useAgentStore } from "../../../../store";
import { TokenNumber } from "@/components/token-number";
import { useSolBalance } from "@/lib/hooks/use-solana";
import { PublicKey } from "@solana/web3.js";
import { CancelButton } from "../../cancel-button";
import { isValidSolanaAddress } from "@/lib/utils/address";
import { CopyTradeForm } from "./form";
export type CopyTradeFormType = {
  name: FormValue<string>;
  amount: FormValue<string>;
  target: FormValue<string>;
  mode: FormValue<"amount" | "percentage">;
  isCopySell: FormValue<boolean>;
};
const initForm = {
  name: {
    value: "",
    required: true,
    isInValid: false,
    errorMsg: "",
  },
  mode: {
    value: "amount",
    required: true,
    isInValid: false,
    errorMsg: "",
  },
  amount: {
    value: "",
    required: true,
    isInValid: false,
    errorMsg: "",
  },
  target: {
    value: "",
    required: true,
    isInValid: false,
    errorMsg: "",
  },
  isCopySell: {
    value: false,
    required: false,
    isInValid: false,
    errorMsg: "",
  },
} satisfies CopyTradeFormType;
export function CopyTrade({ message }: { message: ContentWithUser }) {
  const { nft } = useAgentStore();
  const { deleteMessageById, addAndSendMessage } = useChatContext();
  const [form, setForm] = useState<CopyTradeFormType>(initForm);

  return (
    <ChatContentContainer message={message}>
      <div className='flex flex-col gap-16 w-full'>
        <div className='flex items-center gap-4'>
          <span className='font-bold text-size-16'>Copy Trade</span>
          <Tooltip
            content={
              "Copy Trade allows you to copy the buys and sells of any target wallet."
            }
          >
            <IconInfo />
          </Tooltip>
        </div>
        <CopyTradeForm
          form={form}
          setForm={setForm}
          address={nft.agentAccount.solana}
        />
        <div className='w-full flex justify-end items-center gap-16'>
          <CancelButton
            onClick={() => {
              deleteMessageById(message.id);
            }}
          />
          <Button
            size='s'
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

              addAndSendMessage(
                form.mode.value === "amount"
                  ? `Copy trade the ${form.target.value} wallet, named ${
                      form.name.value
                    }, invest a fixed amount of ${
                      form.amount.value
                    } SOL per trade, and ${
                      form.isCopySell ? "enable" : "disable"
                    } copy selling.`
                  : `Copy trade the ${form.target.value} wallet, named ${
                      form.name.value
                    }, invest a fixed percentage of ${
                      form.amount.value
                    }% of the target per trade, and ${
                      form.isCopySell ? "enable" : "disable"
                    } copy selling.`
              );
              deleteMessageById(message.id);
            }}
          >
            Confirm
          </Button>
        </div>
      </div>
    </ChatContentContainer>
  );
}
