import Image from "next/image";
import { ConnectButton } from "./home/connect-button";

export default function Home() {
  return (
    <main className='h-screen w-screen flex flex-col items-center justify-center gap-8'>
      <Image src={"/brand.png"} height={100} width={362} alt='brand' />
      <h1
        style={{
          textShadow: "0px 0px 6px rgba(255, 255, 255, 0.60)",
        }}
        className='text-size-32 font-bold text-white'
      >
        Make AI agent become an NFT
      </h1>
      <h2 className='font-medium text-size-24 text-white'>Demo</h2>
      <div className='h-40'></div>
      <ConnectButton />
    </main>
  );
}
