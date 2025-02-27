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

export function Actions({ nft }: { nft: NFT }) {
  const { publicKey } = useWallet();
  const { addMessage, generateMessageId } = useChatContext();
  const [action, setAction] = useState<Action | null>(null);
  const onActionClick = useMemoizedFn((action: Action) => {
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

        addMessage(newMessages, true);
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

        addMessage(newMessages, true);
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

        addMessage(newMessages, true);
        break;
      default:
        break;
    }
  });
  const onTradeClick = useMemoizedFn((tradeAction: TradeAction) => {
    if (!isOwner(publicKey?.toBase58() ?? "", nft.owner ?? "")) {
      message("Available to owner only", {
        type: "error",
      });
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

        addMessage(newMessages, true);
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

        addMessage(newMessages, true);
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

        addMessage(newMessages, true);
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

        addMessage(newMessages, true);
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

        addMessage(newMessages, true);
        break;
      case "copy-trade":
        newMessages = [
          {
            text: "Copy Trade",
            webAction: "trade",
            step: "input",
            tradeAction: "copy-trade",
            user: "user",
            createdAt: Date.now(),
            id: generateMessageId("copy-trade"),
          },
        ];

        addMessage(newMessages, true);
        break;
      default:
        break;
    }
  });
  return (
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
          if (process.env.DEPLOY_ENV === "prod" && action !== "airdrop") {
            return null;
          }
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
  );
}
