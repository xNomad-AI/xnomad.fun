import { userStorage } from "@/lib/user/storage";
import { api } from "@/primitive/api";

export interface GetSwapCallDataDto {
  chainName?: string;
  inputTokenCA: string;
  outputTokenCA: string;
  amount: string;
  slippage: number; // 0.01 = 1%
  userWalletAddress: string;
  exactFees?: {
    feeCollector: string;
    feeRate: string; // bps
  }[];
}
export async function getSwapXCallData(params: GetSwapCallDataDto) {
  const response = await fetch(
    `${process.env.NEXT_CLIENT_API_HOST}/address/swap/calldata`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userStorage.getCurrentToken()?.jwt}`,
      },
      body: JSON.stringify({
        ...params,
        chainName: "bsc",
      }),
    }
  );
  if (!response.ok) {
    throw new Error("Failed to fetch swap call data");
  }
  const data = await response.json();
  if (!data) {
    throw new Error("Failed to fetch swap call data");
  }
  return data as {
    to: `0x${string}`;
    data: `0x${string}`;
    value: string;
  };
}
