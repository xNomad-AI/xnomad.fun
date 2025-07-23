import BigNumber from "bignumber.js";

export function getAmountOutMin(
  amount: number | string | BigNumber,
  slippage: number | string
) {
  return BigNumber(amount)
    .times(BigNumber(1).minus(slippage).div(1))
    .dp(0, BigNumber.ROUND_DOWN);
}
