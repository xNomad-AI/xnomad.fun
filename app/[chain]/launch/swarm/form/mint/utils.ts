import { api } from "@/primitive/api";
import * as Client from "@web3-storage/w3up-client";
import * as Delegation from "@web3-storage/w3up-client/delegation";
import { useMount } from "ahooks";
import { useState } from "react";
export function processCsvFile(csv: File) {
  return new Promise<string[]>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (!content) {
        reject(new Error("File is empty"));
        return;
      }
      resolve(
        (content as string)
          .split("\n")
          .flatMap((address) => address.split(","))
          .map((address) => address.trim())
          .filter(Boolean)
      );
    };
    reader.onerror = reject;
    reader.readAsText(csv);
  });
}
async function getWeb3StorageClient() {
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
  return client;
}
export function useWeb3StorageClient() {
  const [client, setClient] = useState<Client.Client | null>(null);
  useMount(async () => {
    const client = await getWeb3StorageClient();
    setClient(client);
  });
  return client;
}
