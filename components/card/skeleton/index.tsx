import { motion } from "framer-motion";
import { useMemo } from "react";

type Props = {
  lines?: number;
};
export function CardViewSkeleton(props: Props) {
  const { lines = 3 } = props;
  const s = useMemo(() => {
    return Array.from({ length: lines }).map((_, index) => `line${index}`);
  }, [lines]);
  return (
    <div className='relative group rounded-8 border-1 m-1 bg-background cursor-pointer shadow-base overflow-hidden'>
      <motion.div className='w-full relative z-1 bg-surface aspect-square overflow-hidden flex items-center justify-center'>
        <div className='w-[5rem] h-[4.25rem] bg-surface' />
      </motion.div>
      <div className='relative z-5 px-16 h-0'>
        <div className='relative -top-16 w-32 h-32 rounded-4 bg-surface'></div>
      </div>
      <div className='relative z-2 px-16 pt-24 pb-16'>
        <div className='flex flex-col gap-8'>
          {s.map((key) => (
            <div className='bg-surface h-20 rounded-4' key={key}></div>
          ))}
        </div>
      </div>
    </div>
  );
}
