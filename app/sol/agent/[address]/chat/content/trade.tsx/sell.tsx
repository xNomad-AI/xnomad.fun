import { validNumberInput } from "@/lib/utils/input-helper";
import { Button, FormItem, FormValue, TextField } from "@/primitive/components";
import { useState } from "react";
import { useChatContext } from "../../store";
import { ChatContentContainer } from "../container";
import { ContentWithUser } from "../../types";
import { useAgentStore } from "../../../store";
import { TokenInputSell, TokenValue } from "../token-input";

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
                  `Sell ${form.amount.value} ${
                    form.token.value.ticker ? `${form.token.value.ticker} ` : ""
                  }${form.token.value.ca} for SOL`
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
          <span className='font-bold text-size-16'>Sell</span>
          <FormItem label={"Token"} {...form.token}>
            <TokenInputSell
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
            <TextField
              value={form.amount.value}
              placeholder='Amount'
              onChange={(event) => {
                const value = validNumberInput(event.target.value, true);
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
          ⬇️Type: Sell
          <br />
          🪙Token:{" "}
          {form.token.value.ticker ? `${form.token.value.ticker} ` : ""}
          {form.token.value.ca}
          <br />
          💰Sell Amount:&nbsp;{form.amount.value}
        </p>
      )}
    </ChatContentContainer>
  );
}
