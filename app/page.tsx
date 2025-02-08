import Image from "next/image";
import { ConnectButton } from "./home/connect-button";
import { Container } from "./layout/contianer";
import { Card } from "@/primitive/components";
import { bungee } from "./layout/font";
import { Car } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <Container className='flex flex-col gap-32 w-full py-64'>
      <div className='flex flex-col gap-8 items-center w-full'>
        <h1
          style={{
            textShadow: "0px 0px 6px rgba(255, 255, 255, 0.60)",
          }}
          className='text-[40px] font-bold text-white'
        >
          Your AI-NFT Smart Terminal
        </h1>
        <p className='text-size-16 text-white'>
          Unleash the infinite power of AI agents' possibilities
        </p>
      </div>
      <div></div>
      <h2 className='text-size-20 font-bold'>Portal</h2>
      <div className='grid grid-cols-2 w-full gap-16 mobile:grid-cols-1'>
        <Link href='/sol/xnomad'>
          <Card className='hover:border-white-40 relative w-full aspect-[16/9] flex items-center justify-center'>
            <img
              src={"/xnomad.webp"}
              className='hover:scale-110 transition-all ease-in-out duration-300 absolute top-0 left-0 w-full h-full'
            />
            <div className='pointer-events-none w-full h-full bg-black-20 absolute left-0 top-0 z-2'></div>
            <span
              className='pointer-events-none text-[40px] z-3'
              style={{
                ...bungee.style,
                textShadow: "0px 0px 6px rgba(255, 255, 255, 0.60)",
              }}
            >
              xNomad
              <br />
              GENESIS
            </span>
          </Card>
        </Link>
        <Link href='/sol/nomads-society'>
          <Card className='hover:border-white-40 relative w-full aspect-[16/9] flex items-center justify-center'>
            <img
              src={"/society.webp"}
              className='hover:scale-110 transition-all ease-in-out duration-300 absolute top-0 left-0 w-full h-full'
            />
            <div className='pointer-events-none w-full h-full bg-black-20 absolute left-0 top-0 z-2'></div>
            <span
              className='text-[40px] z-3 pointer-events-none'
              style={{
                ...bungee.style,
                textShadow: "0px 0px 6px rgba(255, 255, 255, 0.60)",
              }}
            >
              Nomads
              <br />
              Society
            </span>
          </Card>
        </Link>
      </div>
      <div></div>
      <h2 className='text-size-20 font-bold'>Launchpad</h2>
      <Card className='w-full h-[365px] flex items-center justify-center'>
        <span className='text-size-16 text-text2'>Coming Soon...</span>
      </Card>
    </Container>
  );
}
