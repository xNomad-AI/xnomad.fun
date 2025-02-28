import { validNumberInput } from "@/lib/utils/input-helper";
import { Button, FormItem, FormValue, TextField } from "@/primitive/components";
import { useState } from "react";
import { useChatContext } from "../../store";
import { ChatContentContainer } from "../container";
import { ContentWithUser } from "../../types";
import { useAgentStore } from "../../../store";
import { TokenInputSell, TokenValue } from "../token-input";
import { AmountInput } from "../amount-input";

export function Sell({ message }: { message: ContentWithUser }) {
  const { deleteMessageById, addAndSendMessage, updateMessage } =
    useChatContext();
  const { portfolio } = useAgentStore();
  const [form, setForm] = useState<{
    token: FormValue<TokenValue>;
    amount: FormValue<string>;
  }>({
    token: {
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
          <span className='font-bold text-size-16'>Sell</span>
          <FormItem label={"Token"} {...form.token}>
            <TokenInputSell
              className='!bg-background'
              tokenLimitList={portfolio?.items.map((item) => ({
                ca: item.address,
                logo: item.logoURI,
                ticker: item.symbol,
                priceUsd: item.priceUsd,
                uiAmount: item.uiAmount,
              }))}
              value={form.token.value}
              onChange={(value) => {
                setForm({
                  ...form,
                  token: {
                    ...form.token,
                    isInValid: false,
                    value,
                  },
                });
              }}
            />
          </FormItem>
          <FormItem label={"Sell Amount"} {...form.amount}>
            <AmountInput
              value={form.amount.value}
              amount={
                portfolio?.items.find(
                  (item) => item.address === form.token.value.ca
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
                  `Sell ${form.amount.value} ${
                    form.token.value.ticker ? `${form.token.value.ticker} ` : ""
                  }${form.token.value.ca} for SOL`
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
