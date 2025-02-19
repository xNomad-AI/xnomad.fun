import { validNumberInput } from "@/lib/utils/input-helper";
import { Button, FormItem, FormValue, TextField } from "@/primitive/components";
import { useEffect, useMemo, useState } from "react";
import { useAgentStore } from "../../../store";
import { TokenNumber } from "@/components/token-number";
import BigNumber from "bignumber.js";
import { useChatContext } from "../../store";
import { ResponseContainer } from "../container";
import { ActionStep, ContentWithUser } from "../../types";
import { useSolana } from "@/lib/hooks/use-solana";
import { useWallet } from "@solana/wallet-adapter-react";
import { NFT } from "@/types";
import { PublicKey } from "@solana/web3.js";

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
    tokenContractAddress: FormValue<string>;
    amount: FormValue<string>;
    symbol: FormValue<string>;
  }>({
    tokenContractAddress: {
      value: "",
      required: true,
      isInValid: false,
      errorMsg: "",
    },
    symbol: {
      value: "",
      required: false,
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
    <ResponseContainer
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
                  `Buy ${form.symbol.value ? `${form.symbol.value} ` : ""}${
                    form.tokenContractAddress.value
                  } with ${form.amount.value} SOL`
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
          <FormItem
            label={"Token Contract Address"}
            {...form.tokenContractAddress}
          >
            <TextField
              value={form.tokenContractAddress.value}
              placeholder='Token Contract Address'
              onChange={(event) => {
                setForm({
                  ...form,
                  tokenContractAddress: {
                    ...form.tokenContractAddress,
                    value: event.target.value,
                  },
                });
              }}
            />
          </FormItem>
          <FormItem label={"Symbol"} {...form.symbol}>
            <TextField
              value={form.symbol.value}
              placeholder='Symbol (optional)'
              onChange={(event) => {
                setForm({
                  ...form,
                  symbol: {
                    ...form.symbol,
                    value: event.target.value,
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
          🪙Token: {form.symbol.value ? `${form.symbol.value} ` : ""}
          {form.tokenContractAddress.value}
          <br />
          💰Buy Amount:&nbsp;
          <TokenNumber className='inline-flex' number={form.amount.value} /> SOL
        </p>
      )}
    </ResponseContainer>
  );
}
