import {
  Button,
  FormItem,
  FormValue,
  Radio,
  RadioButton,
  RadioButtonGroup,
  RadioGroup,
  TextField,
} from "@/primitive/components";
import { useEffect, useState } from "react";
import BigNumber from "bignumber.js";
import { useChatContext } from "../../store";
import { ChatContentContainer } from "../container";
import { ContentWithUser } from "../../types";
import { validNumberInput } from "@/lib/utils/input-helper";
import { useAgentStore } from "../../../store";
import { TokenNumber } from "@/components/token-number";
import { upperFirstLetter } from "@/lib/utils/string";
import { useSolana } from "@/lib/hooks/use-solana";
import { PublicKey } from "@solana/web3.js";
import { NFT } from "@/types";
import { TokenInputBuy, TokenInputSell, TokenValue } from "../token-input";

export function LimitOrder({
  message,
  nft,
}: {
  message: ContentWithUser;
  nft: NFT;
}) {
  const { portfolio } = useAgentStore();
  const { deleteMessageById, addAndSendMessage, updateMessage } =
    useChatContext();
  const [type, setType] = useState<"buy" | "sell">("buy");
  const [form, setForm] = useState<{
    token: FormValue<TokenValue>;
    amount: FormValue<string>;
    target: FormValue<string>;
    direction: FormValue<"above" | "below">;
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
  });
  const { getBalance } = useSolana();
  const [balance, setBalance] = useState<number>();
  useEffect(() => {
    getBalance(new PublicKey(nft.agentAccount.solana)).then((balance) => {
      setBalance(balance);
    });
  }, []);
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
                debugger;
                updateMessage({ ...message, step: "finish" });
                addAndSendMessage(
                  type === "buy"
                    ? `Create an automatic task to buy ${form.token.value.ca} with ${form.amount.value} SOL when the token price is ${form.direction.value} ${form.target.value}`
                    : `Create an automatic task to sell ${form.amount.value} ${form.token.value.ca} for SOL when the token price is ${form.direction.value} ${form.target.value}`
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
          <span className='font-bold text-size-16'>Limit Order</span>
          <RadioButtonGroup value={type} onChange={setType} disableAnimation>
            <RadioButton value='buy'>Limit Buy</RadioButton>
            <RadioButton value='sell'>Limit Sell</RadioButton>
          </RadioButtonGroup>
          <FormItem label={"Token"} {...form.token}>
            {type === "buy" ? (
              <TokenInputBuy
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
              label={type === "buy" ? "Buy Amount(SOL)" : "Sell Amount"}
              {...form.amount}
            >
              <TextField
                value={form.amount.value}
                placeholder={type === "buy" ? "SOL" : "Amount"}
                onChange={(event) => {
                  const value = validNumberInput(event.target.value, true);
                  setForm({
                    ...form,
                    amount: {
                      ...form.amount,
                      value,
                      isInValid: false,
                    },
                  });
                }}
              />
            </FormItem>
            {type === "buy" ? (
              <div className='text-size-12'>
                Balance:&nbsp;
                <TokenNumber number={BigNumber(balance ?? "0").div(10 ** 9)} />
                &nbsp;SOL
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
          ⬇️Type: Limit {type} order
          <br />
          🪙Token:&nbsp;{form.token.value.ticker}&nbsp;
          {form.token.value.ca}
          <br />
          💰{upperFirstLetter(type)} Amount:&nbsp;{form.amount.value}
          <br />
          ⚡️Trigger: price above ${form.target.value}
        </p>
      )}
    </ChatContentContainer>
  );
}
