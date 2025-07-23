import Lottie from "lottie-react";
import { useSwarmStore } from "../store";
import Rocket from "../../nft/content/rocket.json";
import { Button } from "@/primitive/components";
import { useRouter } from "next/navigation";
import { useChainStore } from "@/app/layout/chain-provider";
export function Result() {
  const { chain } = useChainStore();
  const { step, form, resetAll } = useSwarmStore();
  const router = useRouter();
  return (
    <>
      {step === "waiting" && (
        <div className='w-full h-full flex items-center justify-center flex-col gap-16'>
          <div className='w-[10rem] h-[10rem]'>
            <Lottie animationData={Rocket} loop />
          </div>
          <p className='text-size-16 font-bold text-center'>
            Estimated time is about 10s. Please do not close the page
            <br />
            until asset submission is completed.
          </p>
        </div>
      )}
      {step === "success" && (
        <div className='w-full h-full flex items-center justify-center flex-col gap-16'>
          <img
            alt='Swarm Image'
            height={320}
            width={320}
            className='flex-shrink-0 rounded-12 border object-contain border-white-20 w-[20rem] aspect-square'
            src={URL.createObjectURL(form.basic.image.value as File)}
          />
          <p className='text-center text-size-20 font-bold'>
            Congratulations! Your Swarm was launched successfully!
          </p>
          <div className='w-full flex items-center justify-center'>
            <Button
              className='!w-full max-w-[400px]'
              onClick={() => {
                router.push(`/${chain}/collection/${form.basic.name.value}`);
                resetAll();
              }}
            >
              View My AI-NFT
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
