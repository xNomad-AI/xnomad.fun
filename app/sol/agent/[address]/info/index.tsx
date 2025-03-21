"use client";
import { bungee } from "@/app/layout/font";
import { XNOMAD_ID } from "@/app/sol/xnomad/constants";
import { Address } from "@/components/address";
import { TextWithEllipsis } from "@/components/text-with-ellipsis";
import { useRarity } from "@/lib/utils/rarity/use-rarity";
import {
  IconContract,
  Modal,
  ModalContent,
  ModalTitleWithBorder,
  RadioButton,
  RadioButtonGroup,
} from "@/primitive/components";
import { Character } from "@elizaos/core";
import clsx from "clsx";
import { PropsWithChildren, useEffect, useMemo, useState } from "react";
import { marked } from "marked";
import { useAgentStore } from "../store";
import { motion } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import { isOwner } from "@/lib/user/ownership";
import { SideWalletButton } from "./side-wallet-button";
import { SideWallet } from "../content/wallet/side-wallet";
import { CollapseCard } from "@/primitive/components/card/collapes";
async function parseMarkdownText(text: string) {
  const markedText = await marked.parse(text);
  return markedText;
}
export function InfoSection({ isMobile }: { isMobile?: boolean }) {
  const { publicKey } = useWallet();
  const { nft, sideWalletVisible } = useAgentStore();
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
        opacity: sideWalletVisible ? 1 : 0,
        width: sideWalletVisible ? "20rem" : 0,
      }}
      className={clsx(
        "portrait-tablet:!w-full mr-48 flex-shrink-0 h-[calc(100vh-64px-64px)] overflow-visible",
        {
          "!hidden portrait-tablet:!flex": isMobile,
          "flex portrait-tablet:!hidden": !isMobile,
        }
      )}
    >
      <div className='w-[20rem] h-full flex flex-col gap-16 flex-shrink-0'>
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
            <TextWithEllipsis
              className={clsx("text-size-24", bungee.className)}
            >
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
            hidden: tab !== "nft",
          })}
        >
          <CollapseCard
            className='flex-shrink-0'
            title={<span className='font-bold'>Details</span>}
          >
            <CardItem>
              <span>Asset ID</span>
              {<Address address={nft.id} />}
            </CardItem>
            <CardItem>
              <span>Owner</span>
              {nft.owner && (
                <div className='flex items-center'>
                  <Address address={nft.owner} />
                  {isOwner(publicKey?.toBase58(), nft.owner) && "(You)"}
                </div>
              )}
            </CardItem>
            <CardItem>
              <span>Character Files</span>
              <CharacterFileModal character={nft.aiAgent.character} />
            </CardItem>
          </CollapseCard>
          {isXnomad && (
            <CollapseCard
              className='flex-shrink-0'
              title={<span className='font-bold'>Traits</span>}
            >
              <CardItem>
                <span>Rarity</span>
                <span className={style.className}>#{nft.rarity.rank}</span>
              </CardItem>
              {nft.traits.map((trait) => (
                <CardItem key={trait.value}>
                  <TextWithEllipsis className='max-w-[90px] flex-shrink-0'>
                    {trait.type}
                  </TextWithEllipsis>
                  <TextWithEllipsis>{trait.value}</TextWithEllipsis>
                </CardItem>
              ))}
            </CollapseCard>
          )}
        </div>
        <div
          className={clsx("flex flex-col gap-8 w-full flex-1 min-h-0", {
            hidden: tab !== "wallet",
          })}
        >
          <SideWallet />
        </div>
      </div>
    </motion.div>
  );
}

function CardItem({
  className,
  children,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={clsx(
        "flex items-center justify-between gap-16 text-size-12",
        className
      )}
    >
      {children}
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
        className='cursor-pointer text-size-16'
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
