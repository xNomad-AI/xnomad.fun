import { Address } from "@/components/address";
import {
  Card,
  Button,
  message,
  ModalTitleWithBorder,
  Modal,
  ModalContent,
  TextField,
  Tooltip,
} from "@/primitive/components";
import BigNumber from "bignumber.js";
import { useMemo, PropsWithChildren, useState } from "react";
import { useAgentStore } from "../../store";
import { validNumberInput } from "@/lib/utils/input-helper";
import { useWallet } from "@solana/wallet-adapter-react";
import { useSolana, useSolBalance } from "@/lib/hooks/use-solana";
import { toCardNum } from "@/lib/utils/number";
import { useMemoizedFn } from "ahooks";
import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { useConnectModalStore } from "@/components/connect-modal/store";
import { onError } from "@/lib/utils/error";
import { TokenNumber } from "@/components/token-number";
import { isOwner } from "@/lib/user/ownership";
import clsx from "clsx";

export function DepositContainer({
  children,
  hidden,
}: PropsWithChildren<{ hidden?: boolean }>) {
  const { publicKey } = useWallet();
  const { portfolio, triggerRefresh, nft } = useAgentStore();
  const solItem = useMemo(
    () => portfolio?.items.filter((item) => item.symbol === "SOL")?.[0],
    [portfolio]
  );
  const agentAccountSol = useMemo(
    () => nft?.agentAccount.solana ?? "",
    [nft?.agentAccount.solana]
  );
  const [depositOpen, setDepositOpen] = useState(false);
  const isNFTowner = useMemo(
    () => isOwner(nft?.owner, publicKey?.toBase58()),
    [nft?.owner, publicKey]
  );
  return (
    <div
      className={clsx("w-full flex flex-col gap-16", {
        hidden: hidden,
      })}
    >
      <Card className='flex items-center justify-between gap-16 p-16'>
        <div className='flex flex-col gap-4 min-w-0'>
          <span className='text-size-12'>Agent Wallet</span>
          <Address
            className='text-size-20 font-bold'
            wholeAddress
            enableCopy
            address={agentAccountSol}
          />
          <div>
            Balance:&nbsp;
            <TokenNumber
              number={BigNumber(solItem?.balance ?? "0").div(
                10 ** (solItem?.decimals ?? 9)
              )}
            />
            &nbsp;SOL
          </div>
        </div>
        <Tooltip
          disabled={isNFTowner}
          content={
            "Only the NFT owner can deposit, manage, and use this Agent Wallet"
          }
        >
          <Button
            disabled={!isNFTowner}
            className='!text-black'
            onClick={() => {
              setDepositOpen(true);
            }}
          >
            Deposit
          </Button>
        </Tooltip>
      </Card>
      {children}
      <DepositModal
        address={agentAccountSol}
        onClose={() => {
          setDepositOpen(false);
        }}
        onSuccess={() => {
          triggerRefresh();
        }}
        open={depositOpen}
      />
    </div>
  );
}

function DepositModal({
  address,
  onClose,
  open,
  onSuccess,
}: {
  address: string;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [input, setInput] = useState("");
  const { setVisible } = useConnectModalStore();
  const { publicKey, signTransaction, sendTransaction } = useWallet();
  const { connection } = useSolana();
  const account = useMemo(() => new PublicKey(address), [address]);
  const { balance } = useSolBalance(account);
  const [depositing, setDepositing] = useState(false);
  const deposit = useMemoizedFn(async () => {
    if (!publicKey || !signTransaction || !sendTransaction) {
      setVisible(true);
      return;
    }
    if (!input) return;
    setDepositing(true);
    try {
      const transaction = new Transaction({
        recentBlockhash: (await connection.getLatestBlockhash()).blockhash,
        feePayer: publicKey,
      }).add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(address),
          lamports: new BigNumber(input).multipliedBy(10 ** 9).toNumber(),
        })
      );

      const tx = await sendTransaction(transaction, connection);
      const res = await connection.confirmTransaction(tx, "processed");
      if (res.value.err) {
        throw res.value.err;
      } else {
        message("Deposit success", { type: "success" });
      }
      setDepositing(false);
      onSuccess?.();
      onClose();
    } catch (error) {
      setDepositing(false);
      onError(error);
    }
  });
  return (
    <Modal size='m' open={open} onMaskClick={onClose}>
      <ModalTitleWithBorder closable onClose={onClose}>
        Deposit
      </ModalTitleWithBorder>
      <ModalContent className='gap-16'>
        <span>Deposit SOL to your Agent Wallet</span>
        <div className='w-full gap-8 flex flex-col'>
          <TextField
            className='w-full'
            placeholder='SOL'
            onChange={(e) => {
              const value = validNumberInput(e.target.value, true);
              if (balance.lt(value)) {
                setInput(balance.toString());
              } else {
                setInput(validNumberInput(e.target.value, true));
              }
            }}
          />
          <span className='text-size-12 text-text2'>
            Connected Wallet Balance: {toCardNum(balance.toNumber())} SOL
          </span>
        </div>
        <Button loading={depositing} stretch onClick={deposit}>
          Confirm Deposit
        </Button>
      </ModalContent>
    </Modal>
  );
}
