import {
  Checkbox,
  FormItem,
  IconInfo,
  Radio,
  RadioGroup,
  TextField,
  Tooltip,
} from "@/primitive/components";
import { CopyTradeFormType } from ".";
import { validNumberInput } from "@/lib/utils/input-helper";
import { TokenNumber } from "@/components/token-number";
import { useSolBalance } from "@/lib/hooks/use-solana";
import { useMemo } from "react";
import { PublicKey } from "@solana/web3.js";
import { isValidSolanaAddress } from "@/lib/utils/address";

export function CopyTradeForm({
  form,
  setForm,
  address,
}: {
  form: CopyTradeFormType;
  setForm: (form: CopyTradeFormType) => void;
  address: string;
}) {
  const account = useMemo(() => new PublicKey(address), [address]);
  const { balance } = useSolBalance(account);
  return (
    <>
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
    </>
  );
}

function TooltipInfoIcon({ content }: { content: string }) {
  return (
    <Tooltip content={content}>
      <IconInfo className='text-size-16 text-text1' />
    </Tooltip>
  );
}
