import { ReactNode } from "react";
import { useTradeConfigStore } from "../store/trade-config";
import { Divider, IconSettings, TextField } from "@/primitive/components";
import { TokenNumber } from "@/components/token-number";
import { toCardNum } from "@/lib/utils/number";

interface Props {
  buttonText?: string;
  balance?: string;
  quicks?: { value: number; label: string }[];
  onQuickActionClick?: (value: number) => void;
  onConfirm?: () => void;
  value?: string;
  onChange?: (value: string) => void;
  symbol?: ReactNode;
  quoteSymbol?: ReactNode;
  placeholder?: string;
  loading?: boolean;
  received?: string;
  confirmNode?: ReactNode;
  mevWarning?: boolean;
}

export function BaseTemplate({
  balance,
  symbol,
  placeholder,
  value,
  onChange,
  quicks,
  onQuickActionClick,
  mevWarning,
  quoteSymbol,
  received,
  confirmNode,
}: Props) {
  const { tradeSettingModalController, slippage, priorityFee, tradeMode } =
    useTradeConfigStore();
  return (
    <>
      <div className='flex flex-col gap-8'>
        <div className='flex justify-between items-center'>
          <div>Amount(SOL)</div>
          <div className='flex items-center gap-4 text-size-12'>
            <div>Balance:</div>
            <TokenNumber number={balance ?? ""} />
          </div>
        </div>

        <TextField
          className='bg-surface'
          placeholder={placeholder}
          suffixNode={symbol}
          value={value}
          onChange={(e) => {
            onChange?.(e.target.value);
          }}
        />
        <div className='grid grid-cols-4 gap-8'>
          {quicks?.map(({ label, value }) => (
            <button
              key={label}
              className='bg-surface rounded-6 text-size-12 flex items-center justify-center text-text2'
              onClick={() => {
                onQuickActionClick?.(value);
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      {tradeMode === "ANTI-MEV" && value && mevWarning ? (
        <div
          className='flex items-center h-28 relative cursor-pointer'
          onClick={() => {
            tradeSettingModalController.setTrue();
          }}
        >
          <span className='text-size-12 text-red'>
            Anti-MEV mode is enabled to ensure safety.
          </span>
          <div className='absolute rounded-14 inset-0 bg-red opacity-[0.12]' />
        </div>
      ) : null}
      <div className='flex flex-col gap-col'>
        <div className='flex flex-col gap-8 flex-wrap text-size-12 text-text2'>
          <div className='flex items-center justify-between w-full'>
            <span>Slippage: {slippage * 100}%</span>
            <span>Priority: {toCardNum(priorityFee)}</span>
          </div>
          <div className='flex items-center justify-between gap-16'>
            <div>
              Mode:{" "}
              {tradeMode === "ANTI-MEV" ? (
                <span className='text-red'>Anti-MEV</span>
              ) : (
                <span className='text-text1'>Fast</span>
              )}
            </div>
            <button
              onClick={() => {
                tradeSettingModalController.setTrue();
              }}
            >
              <IconSettings className='text-size-14 text-text1' />
            </button>
          </div>
        </div>
      </div>
      <Divider className='w-full' horizontal />
      <div className='flex items-center justify-between'>
        <span>You Receive</span>
        <TokenNumber number={received ?? ""} suffix={quoteSymbol} />
      </div>
      {confirmNode}
    </>
  );
}
