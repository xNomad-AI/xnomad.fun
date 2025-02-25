import { Button, FormItem, FormValue, TextField } from "@/primitive/components";
import { useState } from "react";
import { useChatContext } from "../../store";
import { ChatContentContainer } from "../container";
import { ContentWithUser } from "../../types";
import { NFT } from "@/types";
import { validNumberInput } from "@/lib/utils/input-helper";
import { TokenInputSell, TokenValue } from "../token-input";
import { useAgentStore } from "../../../store";

export function Transfer({
  message,
  nft,
}: {
  message: ContentWithUser;
  nft: NFT;
}) {
  const { deleteMessageById, addAndSendMessage, updateMessage } =
    useChatContext();
  const { portfolio } = useAgentStore();
  const [form, setForm] = useState<{
    tokenContractAddress: FormValue<TokenValue>;
    amount: FormValue<string>;
    toAddress: FormValue<string>;
  }>({
    tokenContractAddress: {
      value: {
        ca: "",
        logo: "",
        ticker: "",
      },
      required: true,
      isInValid: false,
      errorMsg: "",
    },
    toAddress: {
      value: "",
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
                  `Transfer ${form.amount.value} ${
                    form.tokenContractAddress.value.ticker
                      ? `${form.tokenContractAddress.value.ticker} `
                      : ""
                  }${form.tokenContractAddress.value.ca} to ${
                    form.toAddress.value
                  }`
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
          <span className='font-bold text-size-16'>Transfer</span>
          <FormItem label={"Token"} {...form.tokenContractAddress}>
            <TokenInputSell
              tokenLimitList={portfolio?.items.map((item) => ({
                ca: item.address,
                logo: item.logoURI,
                ticker: item.symbol,
                priceUsd: item.priceUsd,
                uiAmount: item.uiAmount,
              }))}
              value={form.tokenContractAddress.value}
              onChange={(value) => {
                setForm({
                  ...form,
                  tokenContractAddress: {
                    ...form.tokenContractAddress,
                    value,
                  },
                });
              }}
            />
          </FormItem>
          <FormItem label={"Transfer Amount"} {...form.amount}>
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
          <FormItem label={"Transfer to Address"} {...form.toAddress}>
            <TextField
              value={form.toAddress.value}
              placeholder='Receiver Address'
              onChange={(event) => {
                setForm({
                  ...form,
                  toAddress: {
                    ...form.toAddress,
                    value: event.target.value,
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
          ⬇️Type: Transfer
          <br />
          🪙Token:&nbsp;
          {form.tokenContractAddress.value.ticker
            ? `${form.tokenContractAddress.value.ticker} `
            : ""}
          {form.tokenContractAddress.value.ca}
          <br />
          💰Amount:&nbsp;{form.amount.value}
          <br />
          💼From:&nbsp;{nft.agentAccount.solana}
          <br />
          💼To:&nbsp;{form.toAddress.value}
        </p>
      )}
    </ChatContentContainer>
  );
}
