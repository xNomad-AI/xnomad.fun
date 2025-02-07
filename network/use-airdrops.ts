import { api } from "@/primitive/api";
import { useEffect, useState } from "react";
export interface Airdrop {
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
  };
}
export function useAirdrops({ name }: { name?: string }) {
  const [airdrops, setAirDrops] = useState<Airdrop[]>([]);
  useEffect(() => {
    api.airdrop
      .get<Airdrop[]>("/registry", {
        name,
      })
      .then((res) => {
        setAirDrops(res);
      });
  }, [name]);
  return airdrops;
}
