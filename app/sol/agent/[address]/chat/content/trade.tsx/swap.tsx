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

export function Swap({ message }: { message: ContentWithUser }) {
  const { deleteMessageById, addAndSendMessage, updateMessage } =
    useChatContext();
  const { portfolio } = useAgentStore();
  const [form, setForm] = useState<{
    fromContract: FormValue<TokenValue>;
    amount: FormValue<string>;
    toContract: FormValue<TokenValue>;
  }>({
    fromContract: {
      value: {
        ca: "",
        logo: "",
        ticker: "",
      },
      required: true,
      isInValid: false,
      errorMsg: "",
    },
    toContract: {
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
      suffixNode={
        step === "confirm" ? (
          <div className='flex items-center gap-16'>
            <Button
              size='s'
              variant='secondary'
              onClick={() => {
                updateMessage({ ...message, step: "input" });
              }}
            >
              Edit
            </Button>
            <Button
              size='s'
              onClick={() => {
                updateMessage({ ...message, step: "finish" });
                addAndSendMessage(
                  `Swap ${form.amount.value} ${form.fromContract.value.ca} for ${form.toContract.value.ca}`
                );
              }}
            >
              Confirm
            </Button>
          </div>
        ) : null
      }
    >
      {step === "input" ? (
        <div className='flex flex-col gap-16 w-full'>
          <span className='font-bold text-size-16'>Swap A for B</span>
          <div className='flex items-center gap-8 w-full'>
            <FormItem
              className='w-full'
              label={"A Token address"}
              {...form.fromContract}
            >
              <TokenInputSell
                tokenLimitList={portfolio?.items.map((item) => ({
                  ca: item.address,
                  logo: item.logoURI,
                  ticker: item.symbol,
                  priceUsd: item.priceUsd,
                  uiAmount: item.uiAmount,
                }))}
                value={form.fromContract.value}
                onChange={(value) => {
                  setForm({
                    ...form,
                    fromContract: {
                      ...form.fromContract,
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
              {...form.toContract}
            >
              <TokenInputBuy
                value={form.toContract.value}
                onChange={(value) => {
                  setForm({
                    ...form,
                    toContract: {
                      ...form.toContract,
                      value,
                    },
                  });
                }}
              />
            </FormItem>
          </div>
          <FormItem label={"Swap Amount"} {...form.amount}>
            <TextField
              value={form.amount.value}
              placeholder='Amount'
              onChange={(event) => {
                const value = validNumberInput(event.target.value, true);
                setForm({
                  ...form,
                  amount: {
                    ...form.amount,
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
                  if (newForm[key].required && !newForm[key].value) {
                    allValid = false;
                    newForm[key].isInValid = true;
                    newForm[key].errorMsg = "Required";
                  }
                });
                if (!allValid) {
                  setForm(newForm);
                  return;
                }
                updateMessage({ ...message, step: "confirm" });
              }}
            >
              Generate Prompt
            </Button>
          </div>
        </div>
      ) : (
        <p>
          Please confirm the info.
          <br />
          ⬇️Type: Swap(swap A for B)
          <br />
          🪙A Token:&nbsp;{form.fromContract.value.ticker}&nbsp;
          {form.fromContract.value.ca}
          <br />
          🪙B Token:&nbsp;{form.toContract.value.ticker}&nbsp;
          {form.toContract.value.ca}
          <br />
          💰Swap Amount:&nbsp;{form.amount.value}
        </p>
      )}
    </ChatContentContainer>
  );
}
