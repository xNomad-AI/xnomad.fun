import { isOwner } from "@/lib/user/ownership";
import { NFT } from "@/types";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  Action,
  actionConfigs,
  actions,
  TradeAction,
  tradeActionConfigs,
  tradeActions,
} from "../content/types";
import { Button, IconArrowLeft, message } from "@/primitive/components";
import { useMemoizedFn } from "ahooks";
import { useChatContext } from "../store";
import { ContentWithUser } from "../types";
import { useState } from "react";
import { motion } from "framer-motion";
import { ClearMemoryButton } from "../components/clear-memory";
import clsx from "clsx";

export function Actions({ nft }: { nft: NFT }) {
  const { publicKey } = useWallet();
  const { addMessage, generateMessageId } = useChatContext();
  const [action, setAction] = useState<Action | null>(null);
  const addActionMessage = useMemoizedFn((newMessages: ContentWithUser[]) => {
    if (newMessages.length > 0) {
      addMessage(newMessages, true);
    }
  });
  const checkOwnership = useMemoizedFn(() => {
    if (!isOwner(publicKey?.toBase58() ?? "", nft.owner ?? "")) {
      message("Available to owner only", {
        type: "error",
      });
      return false;
    }
    return true;
  });
  const onActionClick = useMemoizedFn((action: Action) => {
    if (!checkOwnership()) {
      return;
    }
    setAction(action);
    let newMessages: ContentWithUser[] = [];
    switch (action) {
      case "airdrop":
        newMessages = [
          {
            text: "Claim Airdrop",
            user: "user",
            createdAt: Date.now(),
            id: generateMessageId("airdrop"),
          },
          {
            text: "Claim Airdrop",
            webAction: "airdrop",
            user: nft.name,
            createdAt: Date.now(),
            id: generateMessageId("airdrop"),
          },
        ];

        break;
      case "trade":
        break;
      case "analyze":
        newMessages = [
          {
            text: "analyze",
            webAction: "analyze",
            step: "input",
            user: "user",
            createdAt: Date.now(),
            id: generateMessageId("analyze"),
          },
        ];

        break;
      case "issue-token":
        newMessages = [
          {
            text: "issue token",
            webAction: "issue-token",
            step: "input",
            user: "user",
            createdAt: Date.now(),
            id: generateMessageId("issue-token"),
          },
        ];
        break;
      default:
        break;
    }
    addActionMessage(newMessages);
  });
  const onTradeClick = useMemoizedFn((tradeAction: TradeAction) => {
    if (!checkOwnership()) {
      return;
    }
    let newMessages: ContentWithUser[] = [];
    switch (tradeAction) {
      case "buy":
        newMessages = [
          {
            text: "Buy",
            webAction: "trade",
            tradeAction: "buy",
            step: "input",
            user: "user",
            id: generateMessageId("buy"),
            createdAt: Date.now(),
          },
        ];

        break;
      case "sell":
        newMessages = [
          {
            text: "Sell",
            webAction: "trade",
            step: "input",
            tradeAction: "sell",
            user: "user",
            createdAt: Date.now(),
            id: generateMessageId("sell"),
          },
        ];

        break;
      case "swap":
        newMessages = [
          {
            text: "Swap",
            webAction: "trade",
            step: "input",
            tradeAction: "swap",
            user: "user",
            createdAt: Date.now(),
            id: generateMessageId("swap"),
          },
        ];

        break;
      case "transfer":
        newMessages = [
          {
            text: "Transfer",
            webAction: "trade",
            step: "input",
            tradeAction: "transfer",
            user: "user",
            createdAt: Date.now(),
            id: generateMessageId("transfer"),
          },
        ];

        break;
      case "limit-order":
        newMessages = [
          {
            text: "Limit Order",
            webAction: "trade",
            step: "input",
            tradeAction: "limit-order",
            user: "user",
            createdAt: Date.now(),
            id: generateMessageId("limit-order"),
          },
        ];
        break;
      default:
        break;
    }
    addActionMessage(newMessages);
  });
  return (
    <div className='flex items-center justify-between w-full'>
      <div className='flex gap-16 flex-1 overflow-hidden'>
        <motion.div
          animate={{
            width: action !== "trade" ? "100%" : 0,
            opacity: action !== "trade" ? 1 : 0,
            display: action !== "trade" ? "flex" : "none",
          }}
          className='flex items-center gap-8'
        >
          {actions.map((action) => {
            return (
              <Button
                size='s'
                className='!font-normal'
                variant='secondary'
                key={action}
                onClick={() => {
                  onActionClick(action);
                }}
                disabled={actionConfigs[action].disabled}
              >
                {actionConfigs[action].title}
              </Button>
            );
          })}
        </motion.div>

        <motion.div
          animate={{
            width: action === "trade" ? "100%" : 0,
            opacity: action === "trade" ? 1 : 0,
            display: action === "trade" ? "flex" : "none",
          }}
          className='flex items-center gap-8 overflow-hidden'
        >
          <Button
            className='!w-32 !px-0'
            onClick={() => setAction(null)}
            size='s'
            variant='secondary'
          >
            <IconArrowLeft className='text-size-16' />
          </Button>
          {tradeActions.map((tradeAction) => (
            <Button
              className='!font-normal whitespace-pre'
              variant='secondary'
              size='s'
              disabled={tradeActionConfigs[tradeAction].disabled}
              onClick={() => {
                onTradeClick(tradeAction);
              }}
            >
              {tradeActionConfigs[tradeAction].title}
            </Button>
          ))}
        </motion.div>
      </div>
      <ClearMemoryButton
        className={clsx({
          hidden: action === "trade",
        })}
      />
    </div>
  );
}
