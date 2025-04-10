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
import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { PropsWithChildren, useMemo } from "react";
import { useLogout } from "@/lib/user/use-logout";
import { usePathname } from "next/navigation";
import { useChainStore } from "../chain-provider";
import { useUserStore } from "../chain-provider/hook";
import { ChainSelect } from "./chain-select";
import { SUPPORTED_CHAINS } from "@/types/preference";

export function Header() {
  const { chain } = useChainStore();

  const navs = useMemo(
    () =>
      [
        chain === "solana"
          ? {
              href: `/solana/xnomad`,
              key: "xnomad",
              label: "Swarms",
            }
          : null,
        {
          href: `/${chain}/agent-token`,
          key: "agent-token",
          label: "Agent Token",
        },
        {
          href: `/${chain}/ugc-agents`,
          key: "ugc-agents",
          label: "UGC Agents",
        },
        {
          href: `/${chain}/launch`,
          key: "create-ai-nft",
          label: "Create",
        },
      ].filter(Boolean) as {
        href: string;
        key: string;
        label: string;
      }[],
    [chain]
  );
  const { userAddress, openConnectModal } = useUserStore();
  const logout = useLogout();

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
          href={`/${chain}`}
          className='flex items-center gap-8 mobile:hidden'
        >
          <Image src={"/brand.png"} width={145} height={40} alt='' />
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
                    if (!userAddress) {
                      e.preventDefault();
                      e.stopPropagation();
                      openConnectModal();
                    }
                  }
                }}
                href={
                  nav.key === "my-ai-nfts"
                    ? `/${chain}/profile/${userAddress}`
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
                        if (!userAddress) {
                          e.preventDefault();
                          e.stopPropagation();
                          openConnectModal();
                        }
                      } else if (!nav.href) {
                        e.preventDefault();
                        e.stopPropagation();
                        message("Coming soon");
                      }
                    }}
                    href={
                      nav.key === "my-ai-nfts"
                        ? `/${chain}/profile/${userAddress}`
                        : nav.href
                    }
                  >
                    <SelectOption selected={false}>{nav.label}</SelectOption>
                  </Link>
                ))}
              </div>
            }
          >
            <button
              title='menue'
              className='h-32 w-32 rounded-8 bg-surface flex items-center justify-center'
            >
              <IconMenu className='text-size-16 text-white' />
            </button>
          </Dropdown>
          {SUPPORTED_CHAINS.length > 1 && <ChainSelect />}
          {!userAddress ? (
            <ConnectButton size='s' />
          ) : (
            <Dropdown
              content={
                <div className='flex flex-col gap-8'>
                  <Link prefetch href={`/${chain}/profile/${userAddress}`}>
                    <SelectOption selected={false}>Profile</SelectOption>
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
                  address={userAddress}
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
  const pathName = usePathname();
  return (
    <Link
      href={href}
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
      className={clsx("text-white-40 hover:text-text1", {
        "!text-text1": href === pathName,
      })}
      prefetch
    >
      {children}
    </Link>
  );
}
