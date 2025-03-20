"use client";
import { bungee } from "@/app/layout/font";
import { XNOMAD_ID } from "@/app/sol/xnomad/constants";
import { Address } from "@/components/address";
import { TextWithEllipsis } from "@/components/text-with-ellipsis";
import { useRarity } from "@/lib/utils/rarity/use-rarity";
import {
  Card,
  IconArrowLeft,
  IconContract,
  Modal,
  ModalContent,
  ModalTitleWithBorder,
  RadioButton,
  RadioButtonGroup,
} from "@/primitive/components";
import { NFT } from "@/types";
import { Character } from "@elizaos/core";
import clsx from "clsx";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { marked } from "marked";
import { useAgentStore } from "../store";
import { TokenNumber } from "@/components/token-number";
import { RateNum } from "@/components/rate-number";
import { motion } from "framer-motion";
import { useLocalStorage, useWallet } from "@solana/wallet-adapter-react";
import { isOwner } from "@/lib/user/ownership";
import { SideWalletButton } from "./side-wallet-button";
import { SideWallet } from "../content/wallet/side-wallet";
async function parseMarkdownText(text: string) {
  const markedText = await marked.parse(text);
  return markedText;
}
export function InfoSection({ isMobile }: { isMobile?: boolean }) {
  const { publicKey } = useWallet();
  const { nft, primaryToken, sideWalletVisible, setSideWalletVisible } =
    useAgentStore();
  const style = useRarity({
    rank: nft.rarity.rank,
    total: nft.collectionId === XNOMAD_ID ? 5000 : Infinity,
  });
  const isXnomad = useMemo(
    () => nft.collectionId === XNOMAD_ID,
    [nft.collectionId]
  );
  const [tab, setTab] = useState<"wallet" | "nft">("wallet");
  return (
    <motion.div
      animate={{
        width: sideWalletVisible ? "20rem" : "0",
        opacity: sideWalletVisible ? 1 : 0,
        display: sideWalletVisible ? "flex" : "none",
      }}
      className={clsx("flex-col portrait-tablet:!w-full gap-16 flex-shrink-0", {
        "!hidden portrait-tablet:!flex": isMobile,
        "flex portrait-tablet:!hidden": !isMobile,
      })}
    >
      <div className='flex gap-12 w-full'>
        <div className='relative rounded-12 overflow-hidden'>
          <img
            className='aspect-square rounded-12 object-contain bg-surface'
            width={64}
            height={64}
            alt=''
            src={nft.image}
          />
          {isOwner(publicKey?.toBase58(), nft.owner) && (
            <div className='w-full absolute z-2 bg-white text-black left-0 bottom-0 h-16 flex items-center justify-center font-bold text-size-12'>
              Owned
            </div>
          )}
        </div>
        <div className='flex flex-col self-center flex-1 min-w-0'>
          <TextWithEllipsis className={clsx("text-size-24", bungee.className)}>
            {nft.name}
          </TextWithEllipsis>
          <span>{isXnomad ? "xNomad Genesis" : nft.collectionName}</span>
        </div>
        <SideWalletButton />
      </div>
      <RadioButtonGroup
        value={tab}
        className='!w-full'
        onChange={setTab}
        disableAnimation
      >
        <RadioButton value='wallet' className='!flex-1'>
          Wallet
        </RadioButton>
        <RadioButton className='!flex-1' value='nft'>
          AI-NFT
        </RadioButton>
      </RadioButtonGroup>
      <div
        className={clsx("flex flex-col gap-8 w-full", {
          hidden: tab !== "wallet",
        })}
      >
        {primaryToken?.address && (
          <Link href={`/sol/agent/${nft.id}?tab=agent-token`}>
            <Card className='p-16 flex flex-col gap-16'>
              <span className='font-bold'>Agent Token</span>
              <div className='flex items-center justify-between gap-16'>
                <div className='flex items-center gap-8 flex-1 min-w-0'>
                  <img
                    className='w-32 h-32 rounded-full object-contain'
                    src={primaryToken.logo}
                  />
                  <div className='flex flex-col min-w-0'>
                    <div className='flex items-center gap-4 min-w-0'>
                      <span className='font-bold'>{primaryToken.symbol}</span>
                      <TextWithEllipsis className='text-text2 text-size-12'>
                        {primaryToken.name}
                      </TextWithEllipsis>
                    </div>
                    <div className='flex items-center gap-4'>
                      <Address
                        address={primaryToken.address ?? ""}
                        enableCopy
                        className='text-text2 text-size-12'
                      />
                    </div>
                  </div>
                </div>
                <div className='flex items-end flex-col'>
                  <TokenNumber prefix={"$"} number={primaryToken.price} />
                  <RateNum
                    className='text-size-12'
                    num={primaryToken.priceChange24h}
                  />
                </div>
              </div>
            </Card>
          </Link>
        )}
        <Card className='flex flex-col gap-16 p-16 w-full'>
          <div className='flex items-center justify-between'>
            <span className='font-bold'>Asset ID</span>
            {<Address address={nft.id} />}
          </div>
          <div className='flex items-center justify-between'>
            <span className='font-bold'>Owner</span>
            {nft.owner && <Address address={nft.owner} />}
          </div>
          <div className='flex items-center justify-between'>
            <span className='font-bold'>Character Files</span>
            <CharacterFileModal character={nft.aiAgent.character} />
          </div>
        </Card>
        {isXnomad && (
          <Card className='flex flex-col gap-16 p-16 w-full'>
            <div className='flex items-center justify-between'>
              <span className='font-bold'>Rarity</span>
              <span className={style.className}>#{nft.rarity.rank}</span>
            </div>
          </Card>
        )}
        {isXnomad && (
          <Card className='flex flex-col gap-16 p-16 w-full'>
            <span className='font-bold'>Traits</span>
            {nft.traits.map((trait) => (
              <div
                key={trait.value}
                className='flex items-center justify-between gap-16'
              >
                <TextWithEllipsis className='max-w-[90px] flex-shrink-0'>
                  {trait.type}
                </TextWithEllipsis>
                <TextWithEllipsis>{trait.value}</TextWithEllipsis>
              </div>
            ))}
          </Card>
        )}
      </div>
      <div
        className={clsx("flex flex-col gap-8 w-full", {
          hidden: tab !== "nft",
        })}
      >
        <SideWallet />
      </div>
    </motion.div>
  );
}

function CollectionLogo({
  size,
  className,
  logo,
}: {
  size?: number;
  className?: string;
  logo: string;
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
      }}
      className={clsx(className, "rounded-4 border overflow-hidden")}
    >
      <img
        width={size}
        height={size}
        alt=''
        className='object-cover'
        src={logo}
      />
    </div>
  );
}

function CharacterFileModal({ character }: { character: Character }) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  useEffect(() => {
    parseMarkdownText(JSON.stringify(character, null, "\n\u00A0")).then(
      setContent
    );
  }, [character]);
  return (
    <>
      <IconContract
        className='cursor-pointer text-size-20'
        onClick={() => {
          setOpen(true);
        }}
      />
      <Modal size='m' open={open} onMaskClick={() => setOpen(false)}>
        <ModalTitleWithBorder closable onClose={() => setOpen(false)}>
          Character Files
        </ModalTitleWithBorder>
        <ModalContent className='overflow-auto max-h-[600px]'>
          <p
            dangerouslySetInnerHTML={{
              __html: content,
            }}
          ></p>
        </ModalContent>
      </Modal>
    </>
  );
}
