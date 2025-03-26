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

  const metadataCid = await client.uploadFile(file as FileLike);
  const gateway = "https://ipfs.io/ipfs/";
  const imageUrl = `${gateway}${metadataCid.toString()}`;
  return imageUrl;
}

export interface CreatePreCheck {
  fee: number;
  feeAfterDiscount: number;
  discountPercentage: number;
}
export async function getFourMemeNonce(address: string) {
  const nonceResponse = await fetch(
    "https://four.meme/meme-api/v1/private/user/nonce/generate",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        accountAddress: address,
        verifyType: "LOGIN",
        networkCode: "BSC",
      }),
    }
  );
  const nonceResponseData = await nonceResponse.json();
  if (nonceResponseData.code !== 0) {
    throw new Error(`fetch nonce fail : ${nonceResponseData.msg}`);
  }
  const nonce = nonceResponseData.data;
  const message = `You are sign in Meme ${nonce}`;
  return message;
}
export async function loginFourMeme(
  address: string,
  signature: string,
  walletName: string
) {
  const loginResponse = await fetch(
    "https://four.meme/meme-api/v1/private/user/login/dex",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        region: "WEB",
        langType: "EN",
        loginIp: "",
        inviteCode: "",
        verifyInfo: {
          address: address,
          networkCode: "BSC",
          signature,
          verifyType: "LOGIN",
        },
        walletName: walletName,
      }),
    }
  );
  const loginResponseData = await loginResponse.json();

  if (loginResponseData.code !== 0) {
    throw new Error(`login fail: ${loginResponseData.msg}`);
  }

  return loginResponseData.data;
}
export async function uploadFourMemeTokenImage(userToken: string, image: File) {
  const formData = new FormData();
  formData.append("file", new Blob([image]));

  const response = await fetch(
    "https://four.meme/meme-api/v1/private/token/upload",
    {
      method: "POST",
      body: formData,
      headers: {
        Cookie: `user_token=${userToken}`,
        "meme-web-access": userToken,
        "Content-Type": "multipart/form-data",
      },
    }
  );
  const data = await response.json();
  if (data.code !== 0) {
    throw new Error(data.msg);
  }

  return data.data as string;
}
