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
import { CancelButton } from "../cancel-button";

export function Buy({ message, nft }: { message: ContentWithUser; nft: NFT }) {
  const { deleteMessageById, addAndSendMessage } = useChatContext();
  const { getSolBalance } = useSolana();
  const [balance, setBalance] = useState<BigNumber>(BigNumber(0));
  useEffect(() => {
    getSolBalance(new PublicKey(nft.agentAccount.solana)).then((balance) => {
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
  return (
    <ChatContentContainer message={message}>
      <div className='flex flex-col gap-16 w-full'>
        <span className='font-bold text-size-16'>Buy</span>
        <FormItem label={"Token"} {...form.token}>
          <TokenInputBuy
            className='!bg-background'
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
        <FormItem label={"Buy Amount(SOL)"} {...form.amount}>
          <TextField
            value={form.amount.value}
            className='!bg-background'
            placeholder='SOL'
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
          <div className='text-size-12'>
            Balance:&nbsp;
            <TokenNumber number={balance} />
            &nbsp;SOL
          </div>
        </FormItem>
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
              addAndSendMessage(
                `Buy ${
                  form.token.value.ticker ? `${form.token.value.ticker} ` : ""
                }${form.token.value.ca} with ${form.amount.value} SOL`
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
