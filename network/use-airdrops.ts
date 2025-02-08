import { userStorage } from "@/lib/user/storage";
import { api } from "@/primitive/api";
import { useMemoizedFn } from "ahooks";
import { useEffect, useState } from "react";
interface _Airdrop {
  id: string;
  protocol: "AirdropProgramRegistry";
  version: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  issuerId: string;
  rulesId: string;
  issuer: {
    id: string;
    name: string;
    officialWebsite: string;
    image: string;
    twitter: string;
    telegram: string;
    discord: string;
    contract: string;
    token: string;
    createdAt: string;
    updatedAt: string;
  };
  rules: {
    id: string;
    target: string;
    claimMethod: string;
    claimUrl: string;
    blockchain: string;
    contract: string | null;
    supportDelegate: boolean;
    startAt: string;
    expiresAt: string;
    estimateCost: string | null;
    createdAt: string;
    updatedAt: string;
    checkEligibilityUrl: string;
  };
}
interface ClaimStatus {
  claimable?: boolean;
  claimed?: boolean;
}
export type Airdrop = _Airdrop & ClaimStatus;
export function useAirdrops({
  name,
  agentAddress,
}: {
  name?: string;
  agentAddress: string;
}) {
  const [airdrops, setAirDrops] = useState<Airdrop[]>([]);
  const checkStatus = useMemoizedFn(async (airdrops: Airdrop[]) => {
    const processedAirdrops = [];
    for (const airdrop of airdrops) {
      try {
        const res = await fetch(airdrop.rules.checkEligibilityUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userStorage.getCurrentToken()?.jwt}`,
          },
          body: JSON.stringify({
            agentAddress: agentAddress,
          }),
        });
        const { claimable, claimed }: ClaimStatus = await res.json();
        airdrop.claimable = claimable;
        airdrop.claimed = claimed;
        processedAirdrops.push(airdrop);
      } catch (error) {
        console.log(error);
      }
    }
    setAirDrops(processedAirdrops);
  });
  useEffect(() => {
    api.airdrop
      .get<Airdrop[]>("/registry", {
        name,
      })
      .then((res) => {
        setAirDrops(res);
        checkStatus(res);
      });
  }, [name]);
  return airdrops;
}
