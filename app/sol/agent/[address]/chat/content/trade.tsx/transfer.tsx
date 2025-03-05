import { Button, FormItem, FormValue, TextField } from "@/primitive/components";
import { useState } from "react";
import { useChatContext } from "../../store";
import { ChatContentContainer } from "../container";
import { ContentWithUser } from "../../types";
import { NFT } from "@/types";
import { TokenInputSell, TokenValue } from "../token-input";
import { useAgentStore } from "../../../store";
import { AmountInput } from "../amount-input";
import { useSolana } from "@/lib/hooks/use-solana";
import { PublicKey, TokenAmount } from "@solana/web3.js";
import { useRequest } from "ahooks";
import { CancelButton } from "../cancel-button";

export function Transfer({ message }: { message: ContentWithUser }) {
  const { deleteMessageById, addAndSendMessage } = useChatContext();
  const { portfolio, nft } = useAgentStore();
  const [form, setForm] = useState<{
    token: FormValue<TokenValue>;
    amount: FormValue<string>;
    toAddress: FormValue<string>;
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
  const [tokenAmount, setTokenAmount] = useState<TokenAmount>();
  const { getSPLBalance } = useSolana();
  useRequest(
    async () => {
      if (form.token.value.ca && form.token.value.ca !== "") {
        getSPLBalance(
          form.token.value.ca,
          new PublicKey(nft.agentAccount.solana)
        ).then((balance) => {
          setTokenAmount(balance ?? undefined);
        });
      }
    },
    {
      refreshDeps: [form.token.value.ca, nft.agentAccount.solana],
      pollingInterval: 10000,
    }
  );
  return (
    <ChatContentContainer message={message}>
      <div className='flex flex-col gap-16 w-full'>
        <span className='font-bold text-size-16'>Transfer</span>
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
            tokenAmount={tokenAmount?.uiAmount}
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
        <FormItem label={"Transfer Amount"} {...form.amount}>
          <AmountInput
            value={form.amount.value}
            amount={tokenAmount?.uiAmount}
            decimals={tokenAmount?.decimals}
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
        <FormItem label={"Transfer to Address"} {...form.toAddress}>
          <TextField
            className='!bg-background'
            value={form.toAddress.value}
            placeholder='Receiver Address'
            onChange={(event) => {
              setForm({
                ...form,
                toAddress: {
                  ...form.toAddress,
                  isInValid: false,
                  value: event.target.value,
                },
              });
            }}
          />
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
                `Transfer ${form.amount.value} $${form.token.value.ticker}(${form.token.value.ca}) to ${form.toAddress.value}`
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
