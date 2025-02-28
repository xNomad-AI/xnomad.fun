import {
  Button,
  FormItem,
  FormValue,
  IconArrowForwardright,
} from "@/primitive/components";
import { useState } from "react";
import { useChatContext } from "../../store";
import { ChatContentContainer } from "../container";
import { ContentWithUser } from "../../types";
import { TokenInputBuy, TokenInputSell, TokenValue } from "../token-input";
import { useAgentStore } from "../../../store";
import { AmountInput } from "../amount-input";
import { PublicKey, TokenAmount } from "@solana/web3.js";
import { useSolana } from "@/lib/hooks/use-solana";
import { NFT } from "@/types";
import { useRequest } from "ahooks";
import { CancelButton } from "../cancel-button";

export function Swap({ message, nft }: { message: ContentWithUser; nft: NFT }) {
  const { deleteMessageById, addAndSendMessage } = useChatContext();
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
  const [tokenAmount, setTokenAmount] = useState<TokenAmount>();
  const { getSPLBalance } = useSolana();
  useRequest(
    async () => {
      if (form.fromToken.value.ca && form.fromToken.value.ca !== "") {
        getSPLBalance(
          form.fromToken.value.ca,
          new PublicKey(nft.agentAccount.solana)
        ).then((balance) => {
          setTokenAmount(balance ?? undefined);
        });
      }
    },
    {
      refreshDeps: [form.fromToken.value.ca, nft.agentAccount.solana],
      pollingInterval: 10000,
    }
  );
  return (
    <ChatContentContainer message={message}>
      <div className='flex flex-col gap-16 w-full'>
        <span className='font-bold text-size-16'>Swap A for B</span>
        <div className='flex gap-8 w-full'>
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
              tokenAmount={tokenAmount?.uiAmount}
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
          <IconArrowForwardright className='text-size-20 text-text1 mt-[40px]' />
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
                `Swap ${form.amount.value} ${form.fromToken.value.ca} for ${form.toToken.value.ca}`
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
