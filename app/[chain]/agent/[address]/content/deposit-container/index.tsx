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
import { useSolana } from "@/lib/hooks/use-solana";
import { toCardNum } from "@/lib/utils/number";
import { useMemoizedFn } from "ahooks";
import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { useConnectModalStore } from "@/components/connect-modal/store";
import { onError } from "@/lib/utils/error";
import { TokenNumber } from "@/components/token-number";
import { isOwner } from "@/lib/user/ownership";
import clsx from "clsx";
import { useChainStore } from "@/app/layout/chain-provider";
import { useClient, useSendTransaction } from "wagmi";
import { parseEther } from "viem";
import { waitForTransactionReceipt } from "viem/actions";
import { useUserStore } from "@/app/layout/chain-provider/hook";
import { getCurrencySymbol } from "@/app/layout/chain-provider/utils";
import { useBalanceOnChain } from "@/lib/hooks/balance";

export function DepositContainer({
  children,
  hidden,
}: PropsWithChildren<{ hidden?: boolean }>) {
  const { userAddress } = useUserStore();
  const { chain } = useChainStore();
  const { portfolio, triggerRefresh, nft } = useAgentStore();
  const mainTokenItem = useMemo(
    () =>
      portfolio?.items.filter(
        (item) => item.symbol === getCurrencySymbol(chain)
      )?.[0],
    [portfolio, chain]
  );
  const agentAccount = useMemo(
    () =>
      (chain === "solana" ? nft?.agentAccount.solana : nft.agentAccount.evm) ??
      "",
    [nft?.agentAccount.solana, chain]
  );
  const [depositOpen, setDepositOpen] = useState(false);
  const isNFTowner = useMemo(
    () => isOwner(nft?.owner, userAddress),
    [nft?.owner, userAddress]
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
            address={agentAccount}
          />
          <div>
            Balance:&nbsp;
            <TokenNumber
              number={BigNumber(mainTokenItem?.balance ?? "0").div(
                10 ** (mainTokenItem?.decimals ?? 9)
              )}
            />
            &nbsp;{getCurrencySymbol(chain)}
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
        address={agentAccount}
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

export function DepositModal({
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
  const { chain } = useChainStore();
  const [input, setInput] = useState("");
  const { userAddress, openConnectModal } = useUserStore();
  const { publicKey, sendTransaction } = useWallet();
  const { sendTransactionAsync } = useSendTransaction();
  const client = useClient();
  const { connection } = useSolana();
  const { balance } = useBalanceOnChain(userAddress);
  const [depositing, setDepositing] = useState(false);
  const deposit = useMemoizedFn(async () => {
    if (!userAddress) {
      openConnectModal();
      return;
    }
    if (!input) return;
    setDepositing(true);
    try {
      if (chain === "solana") {
        const transaction = new Transaction({
          recentBlockhash: (await connection.getLatestBlockhash()).blockhash,
          feePayer: publicKey,
        }).add(
          SystemProgram.transfer({
            fromPubkey: publicKey as PublicKey,
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
      } else {
        if (!client) {
          throw new Error("Invalid client");
        }
        const tx = await sendTransactionAsync({
          to: address as `0x${string}`,
          value: parseEther(input),
        });
        const res = await waitForTransactionReceipt(client, {
          hash: tx,
        });
        if (res.status !== "success") {
          throw new Error("Transaction failed");
        } else {
          message("Deposit success", { type: "success" });
        }
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
        <span>Deposit {getCurrencySymbol(chain)} to your Agent Wallet</span>
        <div className='w-full gap-8 flex flex-col'>
          <TextField
            className='w-full'
            placeholder={getCurrencySymbol(chain)}
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
            Connected Wallet Balance: {toCardNum(balance.toNumber())}{" "}
            {getCurrencySymbol(chain)}
          </span>
        </div>
        <Button loading={depositing} stretch onClick={deposit}>
          Confirm Deposit
        </Button>
      </ModalContent>
    </Modal>
  );
}
