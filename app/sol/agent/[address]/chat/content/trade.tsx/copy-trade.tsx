import {
  Button,
  Checkbox,
  FormItem,
  FormValue,
  IconInfo,
  Radio,
  RadioGroup,
  TextField,
  Tooltip,
} from "@/primitive/components";
import { useMemo, useState } from "react";
import { useChatContext } from "../../store";
import { ChatContentContainer } from "../container";
import { ContentWithUser } from "../../types";
import { validNumberInput } from "@/lib/utils/input-helper";
import { useAgentStore } from "../../../store";
import { TokenNumber } from "@/components/token-number";
import { useSolBalance } from "@/lib/hooks/use-solana";
import { PublicKey } from "@solana/web3.js";
import { CancelButton } from "../cancel-button";
import { isValidSolanaAddress } from "@/lib/utils/address";
type CopyTradeForm = {
  name: FormValue<string>;
  amount: FormValue<string>;
  target: FormValue<string>;
  mode: FormValue<"amount" | "percentage">;
  isCopySell: FormValue<boolean>;
};
const initForm = {
  name: {
    value: "",
    required: true,
    isInValid: false,
    errorMsg: "",
  },
  mode: {
    value: "amount",
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
  isCopySell: {
    value: false,
    required: false,
    isInValid: false,
    errorMsg: "",
  },
} satisfies CopyTradeForm;
export function CopyTrade({ message }: { message: ContentWithUser }) {
  const { nft } = useAgentStore();
  const { deleteMessageById, addAndSendMessage } = useChatContext();
  const [form, setForm] = useState<CopyTradeForm>(initForm);
  const account = useMemo(
    () => new PublicKey(nft.agentAccount.solana),
    [nft.agentAccount.solana]
  );
  const { balance } = useSolBalance(account);
  return (
    <ChatContentContainer message={message}>
      <div className='flex flex-col gap-16 w-full'>
        <div className='flex items-center gap-4'>
          <span className='font-bold text-size-16'>Copy Trade</span>
          <Tooltip
            content={
              "Copy Trade allows you to copy the buys and sells of any target wallet."
            }
          >
            <IconInfo />
          </Tooltip>
        </div>

        <FormItem
          label={"Name"}
          desc={
            'Assign a unique "name" to your target wallet for easy identification.'
          }
          {...form.name}
        >
          <TextField
            value={form.name.value}
            placeholder='Name'
            onChange={(event) => {
              setForm({
                ...form,
                name: {
                  ...form.name,
                  isInValid: false,
                  value: event.target.value,
                },
              });
            }}
          />
        </FormItem>
        <FormItem label={"Target Wallet Address"} {...form.target}>
          <TextField
            value={form.target.value}
            placeholder='Target Wallet Address'
            onChange={(event) => {
              const isValid = isValidSolanaAddress(event.target.value);
              setForm({
                ...form,
                target: {
                  ...form.target,
                  isInValid: !isValid,
                  errorMsg: isValid ? "" : "Invalid address",
                  value: event.target.value,
                },
              });
            }}
          />
        </FormItem>

        <FormItem label={"Copy Mode"} {...form.mode}>
          <RadioGroup
            className='gap-16'
            value={form.mode.value}
            onChange={(value) => {
              setForm({
                ...form,
                mode: {
                  ...form.mode,
                  value: value as "amount" | "percentage",
                },
              });
            }}
          >
            <Radio value={"amount"}>
              <div className='flex items-center gap-4'>
                Fixed Amount
                <TooltipInfoIcon content='Invest a set amount per trade. e.g., 1.5 SOL' />
              </div>
            </Radio>
            <Radio value={"percentage"}>
              <div className='flex items-center gap-4'>
                Fixed Percentage
                <TooltipInfoIcon content='The trading value is multiplied by the percentage. e.g., 200%' />
              </div>
            </Radio>
          </RadioGroup>
        </FormItem>
        <div className='w-full flex flex-col gap-8'>
          <FormItem
            label={
              form.mode.value === "amount"
                ? "Buy amount(SOL) of each trade"
                : "Buy percentage of each trade"
            }
            {...form.amount}
          >
            <TextField
              placeholder={form.mode.value === "amount" ? "SOL" : "Percentage"}
              value={form.amount.value}
              suffixNode={form.mode.value === "percentage" ? "%" : "SOL"}
              onChange={(event) => {
                const value = validNumberInput(event.target.value, true);
                setForm({
                  ...form,
                  amount: {
                    ...form.amount,
                    isInValid: false,
                    errorMsg: "",
                    value: value,
                  },
                });
              }}
            />
          </FormItem>
          {form.mode.value === "amount" ? (
            <div className='text-size-12'>
              Balance:&nbsp;
              <TokenNumber number={balance} />
              &nbsp;SOL
            </div>
          ) : null}
        </div>
        <div className='flex items-center gap-8'>
          <Checkbox
            value={form.isCopySell.value}
            onClick={() => {
              setForm({
                ...form,
                isCopySell: {
                  ...form.isCopySell,
                  value: !form.isCopySell.value,
                },
              });
            }}
          />
          <span>Copy Sell</span>
        </div>
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
                  if (!newForm[key].value) {
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
                form.mode.value === "amount"
                  ? `Copy trade the ${form.target.value} wallet, named ${
                      form.name.value
                    }, invest a fixed amount of ${
                      form.amount.value
                    } SOL per trade, and ${
                      form.isCopySell ? "enable" : "disable"
                    } copy selling.`
                  : `Copy trade the ${form.target.value} wallet, named ${
                      form.name.value
                    }, invest a fixed percentage of ${
                      form.amount.value
                    }% of the target per trade, and ${
                      form.isCopySell ? "enable" : "disable"
                    } copy selling.`
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

function TooltipInfoIcon({ content }: { content: string }) {
  return (
    <Tooltip content={content}>
      <IconInfo className='text-size-16 text-text1' />
    </Tooltip>
  );
}
