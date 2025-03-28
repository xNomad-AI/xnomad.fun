import { Button, FormItem, FormValue } from "@/primitive/components";
import { useMemo, useState } from "react";
import { useChatContext } from "../../store";
import { ChatContentContainer } from "../container";
import { ContentWithUser } from "../../types";
import { useAgentStore } from "../../../store";
import { TokenInputSell, TokenValue } from "../token-input";
import { AmountInput } from "../amount-input";
import { useTokenBalanceOnChain } from "@/lib/hooks/balance";
import { PublicKey } from "@solana/web3.js";
import { CancelButton } from "../cancel-button";
import { getCurrencySymbol } from "@/app/layout/chain-provider/utils";
import { useChainStore } from "@/app/layout/chain-provider";

export function Sell({ message }: { message: ContentWithUser }) {
  const { deleteMessageById, addAndSendMessage } = useChatContext();
  const { portfolio, nft } = useAgentStore();
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

  const { chain } = useChainStore();
  const account = useMemo(
    () =>
      chain === "solana"
        ? new PublicKey(nft.agentAccount.solana)
        : nft.agentAccount.evm,
    [nft.agentAccount.solana, chain]
  );
  const { balance: tokenAmount } = useTokenBalanceOnChain(
    form.token.value.ca,
    account
  );
  return (
    <ChatContentContainer message={message}>
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
        <FormItem label={"Sell Amount"} {...form.amount}>
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
                      Object.values(newForm[key].value).every((item) => !item))
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
                `Sell ${form.amount.value} $${form.token.value.ticker}(${
                  form.token.value.ca
                }) for ${getCurrencySymbol(chain)}`
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
