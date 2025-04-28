import { Button, FormValue, IconInfo, Tooltip } from "@/primitive/components";
import { useState } from "react";
import { useChatContext } from "../../../store";
import { ChatContentContainer } from "../../container";
import { ContentWithUser } from "../../../types";
import { useAgentStore } from "../../../../store";
import { CancelButton } from "../../cancel-button";
import { CopyTradeForm } from "./form";
import { getCurrencySymbol } from "@/app/layout/chain-provider/utils";
import { useChainStore } from "@/app/layout/chain-provider";
import { PublicKey } from "@solana/web3.js";

export type CopyTradeFormType = {
  name: FormValue<string>;
  amount: FormValue<string>;
  target: FormValue<string>;
  mode: FormValue<"amount" | "percentage">;
  isCopySell: FormValue<boolean>;
  twitterKOL?: {
    id: string;
    handle: string;
    name: string;
    profilePicture: string;
  };
};

export const initCopyTradeForm = {
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
    value: true,
    required: false,
    isInValid: false,
    errorMsg: "",
  },
} satisfies CopyTradeFormType;

export function CopyTrade({ message }: { message: ContentWithUser }) {
  const { nft } = useAgentStore();
  const { deleteMessageById, addAndSendMessage } = useChatContext();
  const [form, setForm] = useState<CopyTradeFormType>(initCopyTradeForm);
  const { chain } = useChainStore();
  
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
          address={
            chain === "solana"
              ? new PublicKey(nft.agentAccount.solana)
              : nft.agentAccount.evm
          }
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
              if (Object.values(form)
                .filter((item): item is FormValue<any> => 
                  typeof item === 'object' && 'isInValid' in item)
                .some((item) => item.isInValid)) {
                return;
              }
              
              let allValid = true;
              const newForm = { ...form };
              
              // Only validate FormValue fields, not TwitterKOL
              const fieldsToValidate = ['name', 'amount', 'target', 'mode', 'isCopySell'] as const;
              
              fieldsToValidate.forEach((key) => {
                const field = newForm[key];
                if (field.required && !field.value) {
                  allValid = false;
                  field.isInValid = true;
                  field.errorMsg = "Required";
                }
              });
              
              if (!allValid) {
                setForm(newForm);
                return;
              }

              let prompt = '';
              
              if (form.twitterKOL) {
                prompt = form.mode.value === "amount"
                  ? `Copy trade the ${form.target.value} wallet (Twitter: ${form.twitterKOL.handle}), named ${
                      form.name.value
                    }, invest a fixed amount of ${
                      form.amount.value
                    } ${getCurrencySymbol(chain)} per trade, and ${
                      form.isCopySell.value ? "enable" : "disable"
                    } copy selling.`
                  : `Copy trade the ${form.target.value} wallet (Twitter: ${form.twitterKOL.handle}), named ${
                      form.name.value
                    }, invest a fixed percentage of ${
                      form.amount.value
                    }% of the target per trade, and ${
                      form.isCopySell.value ? "enable" : "disable"
                    } copy selling.`;
              } else {
                prompt = form.mode.value === "amount"
                  ? `Copy trade the ${form.target.value} wallet, named ${
                      form.name.value
                    }, invest a fixed amount of ${
                      form.amount.value
                    } ${getCurrencySymbol(chain)} per trade, and ${
                      form.isCopySell.value ? "enable" : "disable"
                    } copy selling.`
                  : `Copy trade the ${form.target.value} wallet, named ${
                      form.name.value
                    }, invest a fixed percentage of ${
                      form.amount.value
                    }% of the target per trade, and ${
                      form.isCopySell.value ? "enable" : "disable"
                    } copy selling.`;
              }

              addAndSendMessage(prompt);
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
