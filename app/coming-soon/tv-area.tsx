"use client";

import Image from "next/image";
import { useRef } from "react";

export function TVArea() {
  const ref = useRef<HTMLVideoElement>(null);
  return (
    <div className='relative z-1'>
      <Image
        onClick={() => {
          if (ref.current) {
            if (ref.current.paused) {
              ref.current.play();
            } else {
              ref.current.pause();
            }
          }
        }}
        src={"/coming-soon/tv.webp"}
        className='z-1 cursor-pointer'
        width={660}
        height={530}
        alt=''
      />
      <video
        ref={ref}
        src='/coming-soon/intro.mp4'
        className='mobile:w-[308px] mobile:h-[184px] w-[437px] h-[273px] object-cover z-2 absolute left-[78px] mobile:left-[36px] top-[81px] mobile:top-[51px]'
        autoPlay
        loop
        controls
        style={{
          mixBlendMode: "multiply",
          maskImage: "url(/coming-soon/tv-mask.webp)",
          maskPosition: "center",
          maskRepeat: "no-repeat",
          maskSize: "cover",
        }}
        playsInline
      />
    </div>
  );
}
