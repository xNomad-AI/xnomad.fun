import { IconArrowLeft } from "@/primitive/components";
import { useAgentStore } from "../store";
import clsx from "clsx";

export function SideWalletButton({ className }: { className?: string }) {
  const { setSideWalletVisible, sideWalletVisible } = useAgentStore();
  return (
    <button
      title='Toggle Side Wallet'
      className={clsx(
        "h-40 w-40 flex items-center justify-center rounded-6 border border-white-20 transition-opacity duration-300 ease-in-out",
        className
      )}
      onClick={() => setSideWalletVisible(!sideWalletVisible)}
    >
      <IconArrowLeft
        className={clsx(
          "text-text1 text-size-24 transition-transform duration-300 ease-in-out",
          {
            "rotate-180": !sideWalletVisible,
          }
        )}
      />
    </button>
  );
}
