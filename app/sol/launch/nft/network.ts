import { api } from "@/primitive/api";
import * as Client from "@web3-storage/w3up-client";
import * as Delegation from "@web3-storage/w3up-client/delegation";
import { FileLike } from "@web3-storage/w3up-client/types";

export async function uploadMetaData(file: File) {
  const client = await Client.create();

  const requestBody = {
    did: client.agent.did(),
  };
  const data = await api.v1.post<Record<number, number>>(
    "/launchpad/create-w3s-delegate",
    requestBody
  );

  const delegation = await Delegation.extract(
    new Uint8Array(Object.values(data))
  );
  if (!delegation.ok) {
    throw new Error("Failed to extract delegation", {
      cause: delegation.error,
    });
  }

  const space = await client.addSpace(delegation.ok);
  client.setCurrentSpace(space.did());

  //上传文件
  const metadataCid = await client.uploadFile(file as FileLike);
  const gateway = "https://ipfs.io/ipfs/"; // 或者其他网关
  const imageUrl = `${gateway}${metadataCid.toString()}`;
  return imageUrl;
}

export interface CreatePreCheck {
  fee: number;
  feeAfterDiscount: number;
  discountPercentage: number;
  tx: string;
}
