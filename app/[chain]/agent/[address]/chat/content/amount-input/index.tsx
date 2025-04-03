import { validNumberInput } from "@/lib/utils/input-helper";
import { TextField } from "@/primitive/components";
import BigNumber from "bignumber.js";

export function AmountInput({
  value,
  onChange,
  placeholder = "Amount",
  amount,
  decimals = 9,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  amount?: number | null;
  decimals?: number | null;
}) {
  return (
    <div className='w-full flex flex-col gap-8'>
      <TextField
        className='!bg-background'
        value={value}
        placeholder={placeholder}
        onChange={(event) => {
          const value = validNumberInput(event.target.value, true);
          onChange(value);
        }}
      />
      {(amount ?? 0) > 0 && (
        <div className='grid grid-cols-4 gap-8'>
          {[25, 50, 75, 100].map((percentage) => (
            <PercentageButton
              key={percentage}
              percentage={percentage}
              onClick={(percentage) => {
                onChange(
                  // token length cannot greater than decimals
                  BigNumber(
                    BigNumber(amount ?? 0)
                      .multipliedBy(percentage)
                      .dividedBy(100)
                      .multipliedBy(10 ** (decimals ?? 9))
                      .toFixed(0, BigNumber.ROUND_DOWN)
                  )
                    .div(10 ** (decimals ?? 9))
                    .toString()
                );
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PercentageButton({
  percentage,
  onClick,
}: {
  percentage: number;
  onClick?: (percentage: number) => void;
}) {
  return (
    <button
      title={`Set ${percentage}%`}
      onClick={() => {
        onClick?.(percentage);
      }}
      className='h-24 bg-background rounded-6 flex items-center justify-center text-text2 text-size-12'
    >
      {percentage}%
    </button>
  );
}
