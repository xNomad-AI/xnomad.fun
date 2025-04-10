import { TextWithEllipsis } from "@/components/text-with-ellipsis";
import { TokenInfo } from "./network";

export function NFTCell({ item }: { item: Pick<TokenInfo, "nft"> }) {
  return item.nft ? (
    <>
      <img
        alt='NFT Image'
        className='size-24 rounded-4 object-contain'
        src={item.nft?.image}
      />
      <TextWithEllipsis className='flex-1'>{item.nft?.name}</TextWithEllipsis>
    </>
  ) : (
    "--"
  );
}
