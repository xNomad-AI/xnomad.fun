import { TextWithEllipsis } from "@/components/text-with-ellipsis";
import { TokenInfo } from "./network";

export function NFTCell({ item }: { item: TokenInfo }) {
  return item.nft ? (
    <>
      <img
        className='size-16 rounded-full object-contain'
        src={item.nft?.image}
      />
      <TextWithEllipsis>{item.nft?.name}</TextWithEllipsis>
    </>
  ) : (
    "--"
  );
}
