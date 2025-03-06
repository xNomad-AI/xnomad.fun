import { IconPump } from "./icons";

export function PoweredBy() {
  return (
    <div className='flex items-center gap-4'>
      <span className='text-size-12 text-text2'>Powered by Pump.fun</span>
      <IconPump className='text-size-16' />
    </div>
  );
}
