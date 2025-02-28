import {
  Button,
  FormItem,
  FormValue,
  IconArrowForward,
  IconArrowForwardright,
  IconArrowRight,
  TextField,
} from "@/primitive/components";
import { useState } from "react";
import BigNumber from "bignumber.js";
import { useChatContext } from "../../store";
import { ChatContentContainer } from "../container";
import { ActionStep, ContentWithUser } from "../../types";
import { validNumberInput } from "@/lib/utils/input-helper";
import { TokenInputBuy, TokenInputSell, TokenValue } from "../token-input";
import { useAgentStore } from "../../../store";
import { AmountInput } from "../amount-input";

export function Swap({ message }: { message: ContentWithUser }) {
  const { deleteMessageById, addAndSendMessage, updateMessage } =
    useChatContext();
  const { portfolio } = useAgentStore();
  const [form, setForm] = useState<{
    fromToken: FormValue<TokenValue>;
    amount: FormValue<string>;
    toToken: FormValue<TokenValue>;
  }>({
    fromToken: {
      value: {
        ca: "",
        logo: "",
        ticker: "",
      },
      required: true,
      isInValid: false,
      errorMsg: "",
    },
    toToken: {
      value: {
        ca: "",
        logo: "",
        ticker: "",
      },
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
  });
  const step = message.step;

  return (
    <ChatContentContainer
      message={message}
      showTimestamp={step !== "input"}
      showCopyButton={step !== "input"}
    >
      {step === "input" ? (
        <div className='flex flex-col gap-16 w-full'>
          <span className='font-bold text-size-16'>Swap A for B</span>
          <div className='flex items-center gap-8 w-full'>
            <FormItem
              className='w-full'
              label={"A Token address"}
              {...form.fromToken}
            >
              <TokenInputSell
                className='!bg-background'
                tokenLimitList={portfolio?.items.map((item) => ({
                  ca: item.address,
                  logo: item.logoURI,
                  ticker: item.symbol,
                  priceUsd: item.priceUsd,
                  uiAmount: item.uiAmount,
                }))}
                value={form.fromToken.value}
                onChange={(value) => {
                  setForm({
                    ...form,
                    fromToken: {
                      ...form.fromToken,
                      isInValid: false,
                      value,
                    },
                  });
                }}
              />
            </FormItem>
            <IconArrowForwardright className='text-size-20 text-text1 mt-30' />
            <FormItem
              className='w-full'
              label={"B Token address"}
              {...form.toToken}
            >
              <TokenInputBuy
                className='!bg-background'
                value={form.toToken.value}
                onChange={(value) => {
                  setForm({
                    ...form,
                    toToken: {
                      ...form.toToken,
                      isInValid: false,
                      value,
                    },
                  });
                }}
              />
            </FormItem>
          </div>
          <FormItem label={"Swap Amount"} {...form.amount}>
            <AmountInput
              value={form.amount.value}
              amount={
                portfolio?.items.find(
                  (item) => item.address === form.fromToken.value.ca
                )?.uiAmount
              }
              onChange={(value) => {
                setForm({
                  ...form,
                  amount: {
                    ...form.amount,
                    isInValid: false,
                    value,
                  },
                });
              }}
            />
          </FormItem>
          <div className='w-full flex justify-end items-center gap-16'>
            <Button
              variant='secondary'
              size='s'
              onClick={() => {
                deleteMessageById(message.id);
              }}
            >
              Cancel
            </Button>
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
                    if (
                      !newForm[key].value ||
                      (typeof newForm[key].value === "object" &&
                        Object.values(newForm[key].value).some((item) => !item))
                    ) {
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
                updateMessage({ ...message, step: "finish" });
                addAndSendMessage(
                  `Swap ${form.amount.value} ${form.fromToken.value.ca} for ${form.toToken.value.ca}`
                );
              }}
            >
              Confirm
            </Button>
          </div>
        </div>
      ) : null}
    </ChatContentContainer>
  );
}
