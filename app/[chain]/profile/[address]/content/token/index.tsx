"use client";
import { useRequest } from "ahooks";
import { TokenFilter } from "./token-filter";
import { TokenList } from "./token-list";
import { api } from "@/primitive/api";
import { Portfolio } from "./type";
import { useParams } from "next/navigation";
import { TokenActionBar } from "./token-action-bar";

export function TokenPage() {
  const { chain, address } = useParams();
  const { data, loading } = useRequest(async () => {
    const tokens = await api.v1.get<{
      portfolios: Portfolio[];
    }>("/agent-account/defi/agents/portfolio", {
      chain,
      address: address as string,
    });
    return tokens;
  });
  return (
    <div className='w-full flex gap-24'>
      <TokenFilter data={data?.portfolios ?? []} />
      <div className='flex-1 flex flex-col gap-16 transition-all duration-300 ease-in-out'>
        <TokenActionBar />
        <TokenList data={data?.portfolios ?? []} loading={loading} />
      </div>
    </div>
  );
}
