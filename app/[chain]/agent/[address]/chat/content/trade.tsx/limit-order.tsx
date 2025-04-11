import {
  Button,
  FormItem,
  FormValue,
  IconClose,
  Radio,
  RadioButton,
  RadioButtonGroup,
  RadioGroup,
  TextField,
} from "@/primitive/components";
import { useMemo, useState } from "react";
import { useChatContext } from "../../store";
import { ChatContentContainer } from "../container";
import { ContentWithUser } from "../../types";
import { validNumberInput } from "@/lib/utils/input-helper";
import { useAgentStore } from "../../../store";
import { TokenNumber } from "@/components/token-number";
import { useBalanceOnChain, useTokenBalanceOnChain } from "@/lib/hooks/balance";
import { TokenInputBuy, TokenInputSell, TokenValue } from "../token-input";
import { AmountInput } from "../amount-input";
import { useMemoizedFn } from "ahooks";
import { CancelButton } from "../cancel-button";
import { getCurrencySymbol } from "@/app/layout/chain-provider/utils";
import { useChainStore } from "@/app/layout/chain-provider";
import { PublicKey } from "@solana/web3.js";
type LimitOrderForm = {
  token: FormValue<TokenValue>;
  amount: FormValue<string>;
  target: FormValue<string>;
  direction: FormValue<"above" | "below">;
  expireTime: FormValue<string>;
};
const initForm = {
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
  direction: {
    value: "above",
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
  target: {
    value: "",
    required: true,
    isInValid: false,
    errorMsg: "",
  },
  expireTime: {
    value: "",
    required: false,
    isInValid: false,
    errorMsg: "",
  },
} satisfies LimitOrderForm;
export function LimitOrder({ message }: { message: ContentWithUser }) {
  const { chain } = useChainStore();
  const { portfolio, nft } = useAgentStore();
  const { deleteMessageById, addAndSendMessage } = useChatContext();
  const [type, _setType] = useState<"buy" | "sell">("buy");
  const [form, setForm] = useState<LimitOrderForm>(initForm);
  const setType = useMemoizedFn((value: "buy" | "sell") => {
    _setType(value);
    setForm(initForm);
  });
  const account = useMemo(
    () =>
      chain === "solana"
        ? new PublicKey(nft.agentAccount.solana)
        : nft.agentAccount.evm,
    [nft.agentAccount.solana, chain]
  );
  const { balance } = useBalanceOnChain(account);
  const { balance: tokenAmount } = useTokenBalanceOnChain(
    form.token.value.ca,
    account,
    {
      disablePooling: type !== "sell",
    }
  );
  return (
    <ChatContentContainer message={message}>
      <div className='flex flex-col gap-16 w-full'>
        <span className='font-bold text-size-16'>Limit Order</span>
        <RadioButtonGroup value={type} onChange={setType} disableAnimation>
          <RadioButton value='buy'>Limit Buy</RadioButton>
          <RadioButton value='sell'>Limit Sell</RadioButton>
        </RadioButtonGroup>
        <FormItem label={"Token"} {...form.token}>
          {type === "buy" ? (
            <TokenInputBuy
              className='!bg-background'
              value={form.token.value}
              onChange={(value) => {
                setForm({
                  ...form,
                  token: {
                    ...form.token,
                    value,
                    isInValid: false,
                  },
                });
              }}
            />
          ) : (
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
                    value,
                    isInValid: false,
                  },
                });
              }}
            />
          )}
        </FormItem>
        <div className='w-full flex flex-col gap-8'>
          <FormItem
            label={
              type === "buy"
                ? `Buy Amount(${getCurrencySymbol(chain)})`
                : "Sell Amount"
            }
            {...form.amount}
          >
            <AmountInput
              placeholder={type === "buy" ? getCurrencySymbol(chain) : "Amount"}
              value={form.amount.value}
              amount={type === "buy" ? undefined : tokenAmount?.uiAmount}
              decimals={type === "buy" ? undefined : tokenAmount?.decimals}
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
          {type === "buy" ? (
            <div className='text-size-12'>
              Balance:&nbsp;
              <TokenNumber number={balance} />
              &nbsp;{getCurrencySymbol(chain)}
            </div>
          ) : null}
        </div>

        <FormItem
          label={
            <div className='flex items-center gap-16'>
              <span>Trigger: Price($)</span>
              <RadioGroup
                className='gap-16'
                value={form.direction.value}
                onChange={(value) => {
                  setForm({
                    ...form,
                    direction: {
                      ...form.direction,
                      value: value as "above" | "below",
                    },
                  });
                }}
              >
                <Radio value={"above"}>Above</Radio>
                <Radio value={"below"}>Below</Radio>
              </RadioGroup>
            </div>
          }
          {...form.target}
        >
          <TextField
            value={form.target.value}
            className='!bg-background'
            prefixNode={<span className='text-text2'>$</span>}
            onChange={(event) => {
              const value = validNumberInput(event.target.value, true);
              setForm({
                ...form,
                target: {
                  ...form.target,
                  isInValid: false,
                  value,
                },
              });
            }}
          />
        </FormItem>
        <FormItem label={"Expire Time"} {...form.expireTime}>
          <label>
            <div className='flex items-center w-full h-40 gap-8 bg-surface border-1 border-white-20 rounded-4'>
              <input
                type='datetime-local'
                value={form.expireTime.value}
                onChange={(e) => {
                  console.log(e.target.value);
                  setForm({
                    ...form,
                    expireTime: {
                      value: e.target.value,
                      isInValid: false,
                      errorMsg: "",
                    },
                  });
                }}
                min={new Date().toISOString().slice(0, 16)}
                max={
                  form.expireTime.value
                    ? new Date(form.expireTime.value).toISOString().slice(0, 16)
                    : undefined
                }
                className='bg-transparent focus-visible:outline-none *:focus-visible:!bg-white-10 flex-1 ml-12'
                aria-label='Time'
              />
              {form.expireTime.value && (
                <IconClose
                  onClick={() => {
                    setForm({
                      ...form,
                      expireTime: {
                        value: "",
                        isInValid: false,
                        errorMsg: "",
                      },
                    });
                  }}
                  className='text-text2 shrink-0 mr-12'
                />
              )}
            </div>
          </label>
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
                type === "buy"
                  ? `Create an automatic task to buy $${
                      form.token.value.ticker
                    }(${form.token.value.ca}) with ${
                      form.amount.value
                    } ${getCurrencySymbol(chain)} when $${
                      form.token.value.ticker
                    } price is ${form.direction.value} $${form.target.value}`
                  : `Create an automatic task to sell ${form.amount.value} $${
                      form.token.value.ticker
                    }(${form.token.value.ca}) for ${getCurrencySymbol(
                      chain
                    )} when $${form.token.value.ticker} price is ${
                      form.direction.value
                    } $${form.target.value}${
                      form.expireTime.value
                        ? `, expire at ${form.expireTime.value}`
                        : ""
                    }`
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
