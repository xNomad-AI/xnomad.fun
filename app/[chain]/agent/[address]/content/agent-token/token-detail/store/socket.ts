import { useChainStore } from "@/app/layout/chain-provider";
import constate from "constate";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

const logger = (...args: any[]) => {
  console.log(
    "%c[TokenPageSocket]",
    "color: green; font-weight: bold;",
    ...args
  );
};

function useService(props: { ca: string; address?: string }) {
  const { ca } = props;
  const { chain } = useChainStore();
  const location = usePathname();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [ohlcInterval, setOhlcInterval] = useState<string>("1m");

  useEffect(() => {
    const socket = io(`https://api.tokenstory.ai/token-transfers`, {
      path: "/transfers",
      transports: ["websocket"],
      upgrade: false,
      reconnection: true,
      reconnectionAttempts: 500,
      reconnectionDelay: 1000,
      timeout: 20000,
      autoConnect: true,
    });

    socket.on("connect", () => {
      socket?.emit("pong");
      socket?.emit("subscribeToken", ca, props.address, ohlcInterval, chain);
    });

    socket.on("ping", () => {
      socket?.emit("pong");
    });

    socket.io.on("reconnect_attempt", (attempt) => {
      logger("Reconnection attempt:", attempt);
    });

    socket.io.on("reconnect", (attempt) => {
      logger("Reconnected after", attempt, "attempts");
    });

    setSocket(socket);
    return () => {
      socket.disconnect();
      setSocket(null);
    };
  }, [ca, ohlcInterval, location]);

  return {
    socket,
  };
}

export const [TokenPageSocketProvider, useTokenPageSocketStore] =
  constate(useService);
