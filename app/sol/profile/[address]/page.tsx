import { Container } from "@/app/layout/contianer";
import { bungee } from "@/app/layout/font";
import { Address } from "@/components/address";
import clsx from "clsx";
import Image from "next/image";

export default function Page({
  params,
}: {
  params: {
    address: string;
  };
}) {
  const { address } = params;
  return (
    <Container className='flex flex-col gap-32 w-full'>
      <div className='flex items-center mb-32'>
        <Image src={"/solana.png"} height={40} width={40} alt='' />
        <Address
          address={address}
          enableCopy
          className={clsx(bungee.className, "text-[40px]")}
        />
      </div>
    </Container>
  );
}
