"use client";
import { ConnectButton } from "@/app/home/connect-button";
import { Address } from "@/components/address";
import {
  Dropdown,
  IconArrowDown,
  IconLogout,
  IconMenu,
  message,
  SelectOption,
} from "@/primitive/components";
import { useWallet } from "@solana/wallet-adapter-react";
import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { PropsWithChildren } from "react";
import { useLogout } from "@/lib/user/use-logout";
import { useConnectModalStore } from "@/components/connect-modal/store";
const navs = [
  {
    href: "/sol/xnomad",
    key: "xnomad",
    label: "xNomad Gallery",
  },
  {
    href: `/profile`,
    key: "my-ai-nfts",
    label: "My AI-NFTs",
  },
  {
    href: "/sol/launch",
    key: "create-ai-nft",
    label: "Create AI-NFT",
  },
];
export function Header() {
  const { publicKey } = useWallet();
  const logout = useLogout();
  const { setVisible } = useConnectModalStore();
  return (
    <>
      <header
        id='header'
        className={clsx(
          "fixed bg-white/[0.01] backdrop-blur-[20px] top-0 left-0 w-full z-10 border-b h-64 flex items-center px-64 mobile:px-16 justify-between"
        )}
      >
        <Link
          prefetch
          href={"/"}
          className='flex items-center gap-8 mobile:hidden'
        >
          <Image src={"/brand.png"} width={145} height={40} alt='' />
          <div className='bg-white-60 text-black rounded-4 text-size-12 font-bold py-2 px-4'>
            Beta
          </div>
        </Link>
        <Link href={"/"} className='hidden mobile:block' prefetch>
          <Image src={"/logo.svg"} width={40} height={40} alt='' />
        </Link>
        <div className='flex items-center gap-32 portrait-tablet:gap-24'>
          <div className='flex items-center gap-32 portrait-tablet:hidden'>
            {navs.map((nav) => (
              <NavItem
                key={nav.key}
                onClick={(e) => {
                  if (nav.key === "my-ai-nfts") {
                    if (!publicKey) {
                      e.preventDefault();
                      e.stopPropagation();
                      setVisible(true);
                    }
                  }
                }}
                href={
                  nav.key === "my-ai-nfts"
                    ? `/sol/profile/${publicKey?.toBase58()}`
                    : nav.href
                }
              >
                {nav.label}
              </NavItem>
            ))}
          </div>
          <Dropdown
            className='hidden portrait-tablet:flex'
            content={
              <div className='flex flex-col gap-8'>
                {navs.map((nav) => (
                  <Link
                    key={nav.key}
                    prefetch
                    onClick={(e) => {
                      if (nav.key === "create-ai-nft") {
                        if (!publicKey) {
                          e.preventDefault();
                          e.stopPropagation();
                          setVisible(true);
                        }
                      }
                    }}
                    href={
                      nav.key === "my-ai-nfts"
                        ? `/sol/profile/${publicKey?.toBase58()}`
                        : nav.href
                    }
                  >
                    <SelectOption selected={false}>{nav.label}</SelectOption>
                  </Link>
                ))}
              </div>
            }
          >
            <button className='h-32 w-32 rounded-8 bg-surface flex items-center justify-center'>
              <IconMenu className='text-size-16 text-white' />
            </button>
          </Dropdown>
          {!publicKey ? (
            <ConnectButton size='s' />
          ) : (
            <Dropdown
              content={
                <div className='flex flex-col gap-8'>
                  <Link prefetch href={`/sol/profile/${publicKey.toBase58()}`}>
                    <SelectOption selected={false}>My AI-NFTs</SelectOption>
                  </Link>

                  <SelectOption
                    handleSelect={() => {
                      logout();
                    }}
                    selected={false}
                  >
                    <IconLogout />
                    Logout
                  </SelectOption>
                </div>
              }
            >
              <div className='flex items-center'>
                <Address
                  className='font-bold'
                  disableTooltip
                  address={publicKey.toBase58() as string}
                />
                <IconArrowDown />
              </div>
            </Dropdown>
          )}
        </div>
      </header>
      <div className={clsx("h-64 w-full")}></div>
    </>
  );
}

function NavItem({
  href,
  children,
  onClick,
}: PropsWithChildren<{ href: string; onClick?: (e: any) => void }>) {
  return (
    <Link
      href={href}
      prefix=''
      onClick={(e) => {
        if (onClick) {
          onClick(e);
          return;
        }

        if (href === "") {
          e.preventDefault();
          message("Coming soon");
        }
      }}
      className='text-white-40 hover:text-text1'
      prefetch
    >
      {children}
    </Link>
  );
}
