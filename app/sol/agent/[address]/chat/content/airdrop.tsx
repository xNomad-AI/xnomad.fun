import { useAirdrops } from "@/network/use-airdrops";
import {
  Button,
  Card,
  IconDiscordFilled,
  IconTelegramFilled,
  IconTwitterX,
  IconWebsiteFilled,
} from "@/primitive/components";
import { NFT } from "@/types";
import { useState } from "react";
import { useChatContext } from "../store";
import { ChatContentContainer } from "./container";
import { ContentWithUser } from "../types";

export function Airdrop({
  nft,
  message,
}: {
  nft: NFT;
  message: ContentWithUser;
}) {
  const [claimedAirdrops, setClaimedAirdrops] = useState<string[]>([]);
  const { airdrops } = useAirdrops({
    agentAddress: nft.agentAccount.solana,
  });
  const { addAndSendMessage } = useChatContext();
  return (
    <ChatContentContainer message={message}>
      <div className='flex flex-col gap-8 w-full'>
        <span>Here are the airdrops you can claim:</span>
        {airdrops?.length > 0
          ? airdrops.map((airdrop) => (
              <Card
                key={airdrop?.id}
                className='py-14 px-8 flex font-bold items-center gap-8 justify-between flex-wrap'
              >
                <div className='flex items-center gap-8'>
                  <img
                    src={airdrop?.issuer?.image}
                    height={20}
                    width={20}
                    className='rounded-full w-20 aspect-square'
                  />
                  <span>{airdrop?.name}</span>
                </div>
                <div className='flex items-center gap-8'>
                  {airdrop?.issuer.officialWebsite && (
                    <a href={airdrop?.issuer.officialWebsite} target='_blank'>
                      <IconWebsiteFilled className='text-size-16' />
                    </a>
                  )}
                  {airdrop?.issuer.twitter && (
                    <a href={airdrop?.issuer.twitter} target='_blank'>
                      <IconTwitterX className='text-size-16' />
                    </a>
                  )}
                  {airdrop?.issuer.telegram && (
                    <a href={airdrop?.issuer.telegram} target='_blank'>
                      <IconTelegramFilled className='text-size-16' />
                    </a>
                  )}
                  {airdrop?.issuer.discord && (
                    <a href={airdrop?.issuer.discord} target='_blank'>
                      <IconDiscordFilled className='text-size-16' />
                    </a>
                  )}
                  <Button
                    disabled={
                      !airdrop.claimable ||
                      airdrop.claimed ||
                      claimedAirdrops.includes(airdrop.id)
                    }
                    onClick={() => {
                      const input = `Claim Airdrop of [${airdrop?.name}]`;
                      setClaimedAirdrops((old) => {
                        return [...old, airdrop.id];
                      });
                      addAndSendMessage(input);
                    }}
                  >
                    {airdrop.claimable
                      ? airdrop.claimed || claimedAirdrops.includes(airdrop.id)
                        ? "Claimed"
                        : "Claim"
                      : "Not Eligible"}
                  </Button>
                </div>
              </Card>
            ))
          : "No airdrops available"}
      </div>
    </ChatContentContainer>
  );
}
