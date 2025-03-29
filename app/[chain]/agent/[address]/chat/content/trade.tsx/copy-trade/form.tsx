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
import { useBalanceOnChain } from "@/lib/hooks/balance";
import { PublicKey } from "@solana/web3.js";
import { isValidAddress } from "@/lib/utils/address";
import { getCurrencySymbol } from "@/app/layout/chain-provider/utils";
import { useChainStore } from "@/app/layout/chain-provider";

export function CopyTradeForm({
  form,
  setForm,
  address,
  type,
}: {
  form: CopyTradeFormType;
  setForm: (form: CopyTradeFormType) => void;
  address: PublicKey | string;
  type?: "edit" | "add";
}) {
  const { chain } = useChainStore();
  const { balance } = useBalanceOnChain(address);
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
          disabled={type === "edit"}
          value={form.target.value}
          placeholder='Target Wallet Address'
          onChange={(event) => {
            const isValid = isValidAddress(event.target.value, chain);
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
              <TooltipInfoIcon
                content={`Invest a set amount per trade. e.g., 1.5 ${getCurrencySymbol(
                  chain
                )}`}
              />
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
              ? `Buy amount(${getCurrencySymbol(chain)}) of each trade`
              : "Buy percentage of each trade"
          }
          {...form.amount}
        >
          <TextField
            placeholder={
              form.mode.value === "amount"
                ? getCurrencySymbol(chain)
                : "Percentage"
            }
            value={form.amount.value}
            suffixNode={
              form.mode.value === "percentage" ? "%" : getCurrencySymbol(chain)
            }
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
            &nbsp;{getCurrencySymbol(chain)}
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
        <div className='flex items-center gap-4'>
          <span>Copy Sell</span>
          <TooltipInfoIcon content='When the target wallet sells, automatically sell the same proportion of holdings.' />
        </div>
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
