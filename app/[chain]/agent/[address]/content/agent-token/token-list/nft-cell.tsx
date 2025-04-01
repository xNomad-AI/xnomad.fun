import { TextWithEllipsis } from "@/components/text-with-ellipsis";
import { TokenInfo } from "./network";

export function NFTCell({ item }: { item: TokenInfo }) {
  return item.nft ? (
    <>
      <img
        alt='NFT Image'
        className='size-24 rounded-4 object-contain'
        src={item.nft?.image}
      />
      <TextWithEllipsis>{item.nft?.name}</TextWithEllipsis>
    </>
  ) : (
    "--"
  );
}
