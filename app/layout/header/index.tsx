"use client";
import { ConnectButton } from "@/app/home/connect-button";
import { Address } from "@/components/address";
import {
  Button,
  Dropdown,
  IconArrowDown,
  IconLogout,
  message,
  SelectOption,
} from "@/primitive/components";
import { useWallet } from "@solana/wallet-adapter-react";
import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PropsWithChildren } from "react";
import { useLogout } from "@/src/user/use-logout";
const navs = [
  {
    href: "/sol/xnomad",
    key: "xnomad",
    label: "xNomad Gallery",
  },
  {
    href: "",
    key: "my-ai-nfts",
    label: "My AI-NFTs",
  },
  {
    href: "/sol/launch",
    key: "create-ai-nft",
    label: (
      <Button size='s' className='font-semibold !text-black'>
        Create AI-NFT
      </Button>
    ),
  },
];
export function Header() {
  const pathname = usePathname();
  const { publicKey } = useWallet();
  const logout = useLogout();
  return (
    <>
      <header
        id='header'
        className={clsx(
          "fixed bg-white/[0.01] backdrop-blur-[20px] top-0 left-0 w-full z-10 border-b h-64 flex items-center px-64 mobile:px-16 justify-between",
          {
            hidden: pathname === "/",
          }
        )}
      >
        <Link href={"/"}>
          <Image src={"/brand.png"} width={145} height={40} alt='' />
        </Link>
        <div className='flex items-center gap-32'>
          {navs.map((nav) => (
            <NavItem key={nav.key} href={nav.href}>
              {nav.label}
            </NavItem>
          ))}
          {!publicKey ? (
            <ConnectButton size='m' />
          ) : (
            <Dropdown
              content={
                <div className='flex flex-col gap-8'>
                  <Link href={`/sol/account/${publicKey.toBase58()}`}>
                    <SelectOption selected={false}>Profile</SelectOption>
                  </Link>
                  <button onClick={logout}>
                    <SelectOption selected={false}>
                      <IconLogout />
                      Logout
                    </SelectOption>
                  </button>
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
      <div
        className={clsx("h-64 w-full", {
          hidden: pathname === "/",
        })}
      ></div>
    </>
  );
}

function NavItem({ href, children }: PropsWithChildren<{ href: string }>) {
  return (
    <Link
      href={href}
      onClick={(e) => {
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
