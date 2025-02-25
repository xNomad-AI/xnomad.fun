import { validNumberInput } from "@/lib/utils/input-helper";
import { Button, FormItem, FormValue, TextField } from "@/primitive/components";
import { useEffect, useState } from "react";
import { TokenNumber } from "@/components/token-number";
import BigNumber from "bignumber.js";
import { useChatContext } from "../../store";
import { ChatContentContainer } from "../container";
import { ContentWithUser } from "../../types";
import { useSolana } from "@/lib/hooks/use-solana";
import { NFT } from "@/types";
import { PublicKey } from "@solana/web3.js";
import { TokenInputBuy, TokenValue } from "../token-input";

export function Buy({ message, nft }: { message: ContentWithUser; nft: NFT }) {
  const { deleteMessageById, addAndSendMessage, updateMessage } =
    useChatContext();
  const { getBalance } = useSolana();
  const [balance, setBalance] = useState<number>();
  useEffect(() => {
    getBalance(new PublicKey(nft.agentAccount.solana)).then((balance) => {
      setBalance(balance);
    });
  }, []);
  const [form, setForm] = useState<{
    token: FormValue<TokenValue>;
    amount: FormValue<string>;
  }>({
    token: {
      value: {
        ca: "",
        ticker: "",
        logo: "",
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
                addAndSendMessage(
                  `Buy ${
                    form.token.value.ticker ? `${form.token.value.ticker} ` : ""
                  }${form.token.value.ca} with ${form.amount.value} SOL`
                );
                updateMessage({ ...message, step: "finish" });
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
          <span className='font-bold text-size-16'>Buy</span>
          <FormItem label={"Token"} {...form.token}>
            <TokenInputBuy
              value={form.token.value}
              onChange={(value) => {
                setForm({
                  ...form,
                  token: {
                    ...form.token,
                    value,
                  },
                });
              }}
            />
          </FormItem>
          <FormItem label={"Buy Amount(SOL)"} {...form.amount}>
            <TextField
              value={form.amount.value}
              placeholder='SOL'
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
            <div className='text-size-12'>
              Balance:&nbsp;
              <TokenNumber number={BigNumber(balance ?? "0").div(10 ** 9)} />
              &nbsp;SOL
            </div>
          </FormItem>
          <div className='w-full flex justify-end items-center gap-16'>
            <Button
              size='s'
              variant='secondary'
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
          ⬇️Type: Buy
          <br />
          🪙Token:{" "}
          {form.token.value.ticker ? `${form.token.value.ticker} ` : ""}
          {form.token.value.ca}
          <br />
          💰Buy Amount:&nbsp;
          <TokenNumber className='inline-flex' number={form.amount.value} /> SOL
        </p>
      )}
    </ChatContentContainer>
  );
}
