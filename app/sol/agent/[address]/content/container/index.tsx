import { Address } from "@/components/address";
import { toIntl } from "@/lib/utils/number/bignumber";
import {
  Card,
  Button,
  message,
  ModalTitleWithBorder,
  Modal,
  ModalContent,
  TextField,
} from "@/primitive/components";
import BigNumber from "bignumber.js";
import { useMemo, useEffect, PropsWithChildren, useState } from "react";
import { getPortfolio } from "./network";
import { useAgentStore } from "../../store";
import { validNumberInput } from "@/lib/utils/input-helper";
import { useWallet } from "@solana/wallet-adapter-react";
import { useSolana } from "@/lib/hooks/use-solana";
import { toCardNum } from "@/lib/utils/number";
import { useMemoizedFn } from "ahooks";
import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { useConnectModalStore } from "@/components/connect-modal/store";
import { NFT } from "@/types";
import { onError } from "@/lib/utils/error";
import { TokenNumber } from "@/components/token-number";

export function DepositContainer({
  address,
  children,
}: PropsWithChildren<{ address: string }>) {
  const { setPortfolio, portfolio } = useAgentStore();
  const solItem = useMemo(
    () => portfolio?.items.filter((item) => item.symbol === "SOL")?.[0],
    [portfolio]
  );
  const getPortfolioData = useMemoizedFn(async () => {
    getPortfolio({
      address,
    }).then((data) => {
      setPortfolio(data);
    });
  });
  useEffect(() => {
    if (!address) return;
    getPortfolioData();
  }, [address]);
  const [depositOpen, setDepositOpen] = useState(false);
  return (
    <div className='w-full flex flex-col gap-16'>
      <Card className='flex items-center justify-between gap-16 p-16'>
        <div className='flex flex-col gap-4 min-w-0'>
          <span className='text-size-12'>Agent Wallet</span>
          <Address
            className='text-size-20 font-bold'
            wholeAddress
            enableCopy
            address={address}
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
        <Button
          className='!text-black'
          onClick={() => {
            setDepositOpen(true);
          }}
        >
          Deposit
        </Button>
      </Card>
      {children}
      <DepositModal
        address={address}
        onClose={() => {
          setDepositOpen(false);
        }}
        onSuccess={getPortfolioData}
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
  const { getBalance, connection } = useSolana();
  const [balance, setBalance] = useState(0);
  useEffect(() => {
    if (!publicKey) {
      return;
    }
    getBalance(publicKey).then((data) => {
      setBalance(data / 10 ** 9);
    });
  }, [publicKey]);
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
              if (parseFloat(value) > balance) {
                setInput(balance.toString());
              } else {
                setInput(validNumberInput(e.target.value, true));
              }
            }}
          />
          <span className='text-size-12 text-text2'>
            Connected Wallet Balance: {toCardNum(balance)} SOL
          </span>
        </div>
        <Button loading={depositing} stretch onClick={deposit}>
          Confirm Deposit
        </Button>
      </ModalContent>
    </Modal>
  );
}
