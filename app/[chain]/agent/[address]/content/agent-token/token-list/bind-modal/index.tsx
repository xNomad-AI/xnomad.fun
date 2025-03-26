import {
  Button,
  message,
  Modal,
  ModalContent,
  ModalTitleWithBorder,
  SelectOption,
} from "@/primitive/components";
import { NFT } from "@/types";
import { TokenInfo } from "../network";
import { Address } from "@/components/address";
import {
  TokenInputBuy,
  TokenValue,
} from "../../../../chat/content/token-input";
import { CommonInput } from "../../../../chat/content/token-input/common";
import { useEffect, useMemo, useState } from "react";
import { TokenNumber } from "@/components/token-number";
import { useMemoizedFn } from "ahooks";
import { api } from "@/primitive/api";
import { onError } from "@/lib/utils/error";
import { useChainStore } from "@/app/layout/chain-provider";
interface InnerData extends TokenValue {
  volume_24h_usd?: number;
  liquidity?: number;
}
export function BindModal({
  initToken,
  onClose: _onClose,
  onSuccess,
  open,
  nft,
  tokens,
}: {
  initToken?: TokenInfo;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  nft: NFT;
  tokens: TokenInfo[];
}) {
  const { chain } = useChainStore();
  const [isBinding, setIsBinding] = useState(false);
  const [token, setToken] = useState<InnerData>({
    ca: initToken?.address ?? "",
    ticker: initToken?.symbol ?? "",
    logo: initToken?.logo ?? "",
    volume_24h_usd: initToken?.volume24h,
    liquidity: initToken?.liquidity,
  });
  const [search, setSearch] = useState("");
  const data = useMemo(() => {
    const processed = tokens.map((item) => {
      return {
        ca: item.address,
        ticker: item.symbol,
        logo: item.logo,
        volume_24h_usd: item.volume24h,
        liquidity: item.liquidity,
      };
    });
    return processed.filter((item) => {
      return (
        item.ticker.toLowerCase().includes(search.toLowerCase()) ||
        item.ca.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [tokens, search]);
  useEffect(() => {
    if (initToken) {
      setToken({
        ca: initToken.address,
        ticker: initToken.symbol,
        logo: initToken.logo,
      });
    }
  }, [initToken]);
  const onClose = useMemoizedFn(() => {
    setToken({
      ca: initToken?.address ?? "",
      ticker: initToken?.symbol ?? "",
      logo: initToken?.logo ?? "",
      volume_24h_usd: initToken?.volume24h,
      liquidity: initToken?.liquidity,
    });
    setSearch("");
    _onClose();
  });
  const onBind = useMemoizedFn(async () => {
    setIsBinding(true);
    try {
      await api.v1.post(`/nft/${chain}/${nft.id}/bind-primary-coin`, {
        address: token.ca,
      });
      message("Bind success", {
        type: "success",
      });
      onSuccess?.();
      onClose();
    } catch (error) {
      onError(error);
    } finally {
      setIsBinding(false);
    }
  });
  return (
    <Modal onMaskClick={onClose} open={open} size='m'>
      <ModalTitleWithBorder closable onClose={onClose}>
        Bind Agent Token
      </ModalTitleWithBorder>
      <ModalContent>
        <p className='text-text2'>
          Each AI-NFT agent can only have one agent token, which will be
          recommended to the token marketplace and{" "}
          <span className='text-red'>cannot be unbound</span>.
        </p>
        <div className='flex flex-col gap-4 w-full'>
          <span>Token</span>
          <p>
            The creator of the token must be the AI agent wallet(
            <Address
              className='inline-flex'
              address={
                chain === "solana"
                  ? nft.agentAccount.solana
                  : nft.agentAccount.evm
              }
            />
            ).
          </p>
          <CommonInput
            value={token}
            onChange={(value) => {
              setToken(value);
            }}
            data={data}
            setSearch={setSearch}
            search={search}
            TokenItem={TokenItem}
          />
        </div>
        <div className='flex items-center gap-16 w-full'>
          <Button variant='secondary' stretch onClick={onClose}>
            Cancel
          </Button>
          <Button
            stretch
            loading={isBinding}
            onClick={() => {
              onBind();
            }}
          >
            Confirm
          </Button>
        </div>
      </ModalContent>
    </Modal>
  );
}

function TokenItem({
  value,
  selected,
  handleSelect,
}: {
  value: InnerData;
  selected: boolean;
  handleSelect: (value: TokenValue) => void;
}) {
  return (
    <SelectOption
      className='h-[58px]'
      selected={selected}
      handleSelect={(e) => {
        e.stopPropagation();
        handleSelect(value);
      }}
    >
      <img
        src={value.logo}
        alt='logo'
        loading='lazy'
        className='w-32 h-32 rounded-full object-contain'
      />
      <div className='flex flex-col'>
        <span className='text-size-14 text-text1 font-bold'>
          {value.ticker}
        </span>
        <Address address={value.ca} className='text-size-12 text-text2' />
      </div>
      <div className='flex-1'></div>
      <div className='flex flex-col items-end'>
        <div className='flex  text-size-14 text-text1 font-bold'>
          Liq: <TokenNumber number={value?.liquidity ?? ""} />
        </div>
        <div className='flex text-size-12 text-text2'>
          Vol 24h:{" "}
          <TokenNumber number={value?.volume_24h_usd ?? ""} prefix={"$"} />
        </div>
      </div>
    </SelectOption>
  );
}
