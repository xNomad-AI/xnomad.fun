import { api } from "@/primitive/api";

export async function uploadLogo(logo: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", logo);
  const baseUrl = process.env.NEXT_CLIENT_API_HOST;
  const res = await fetch(`${baseUrl}/upload-image`, {
    method: "POST",
    body: formData,
  });
  if (res.status !== 200) {
    throw new Error("Failed to upload image");
  }
  const body: { data: { url: string } } = await res.json();
  return body.data?.url;
}

export function uploadSwarm(params: Swarm) {
  return api.v1.post<{ swarmId: string }>(
    "/launchpad/swarm/create-swarm",
    params
  );
}

export async function uploadAssets(swarmId: string, assets: File) {
  const { uploadUrl, viewUrl } = await api.v1.post<{
    viewUrl: string;
    uploadUrl: string;
  }>("/launchpad/swarm/request-upload-nft-metadata-url");
  const response = await fetch(uploadUrl, {
    method: "PUT",
    body: assets,
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error("Failed to upload assets");
  }
  await api.v1.post<{
    transaction: string;
  }>("/launchpad/swarm/upload-nft-metadata", {
    swarmId,
    viewUrl,
  });
}

export function getSwarmTransaction(swarmId: string) {
  return api.v1.post<{ tx: string }>(
    "/launchpad/swarm/construct-create-collection-tx",
    {
      swarmId,
    }
  );
}

export interface Swarm {
  name: string;
  logo: string;
  description: string;
  socialMedia: {
    website: string;
    twitter: string;
    discord: string;
  };
  creatorInfo: {
    email: string;
    address: string;
    recipientAddress: string;
    royaltyBps: number; //100 = 1%
  };
  aiAgentSettings: {
    background: string;
    style: string;
  };
  mintStages: {
    name: string;
    price: number; //1 = 1 SOL
    maxMintsPerAddress: number;
    startTime: number;
    endTime: number;
    whitelistAddresses?: string[];
  }[];
}
