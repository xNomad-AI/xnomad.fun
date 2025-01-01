import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";

import { useMountFloatLayer } from "../float-layer";
import { globalContainerName, MessageConfig } from "./config";
import { MessageContent } from "./content";
// import { MessageContent } from './content';
import { MessageContainerCallback, messageManager } from "./manager";

type Props = {
  name: string;
};

export function MessageContainer(props: Props) {
  const { name } = props;

  const [messages, setMessages] = useState<MessageConfig[]>([]);

  const add = useCallback((config: MessageConfig) => {
    setMessages((messages) => {
      if (messages.findIndex((message) => message.tag === config.tag) === -1) {
        return messages.concat(config);
      }
      return messages;
    });
  }, []);

  const remove = useCallback((config: MessageConfig) => {
    setMessages((messages) => {
      const index = messages.findIndex((message) => message.tag === config.tag);
      if (index !== -1) {
        return messages.filter((message) => message.tag !== config.tag);
      }
      return messages;
    });
  }, []);

  const update = useCallback((config: MessageConfig) => {
    setMessages((messages) => {
      const index = messages.findIndex((message) => message.tag === config.tag);
      if (index !== -1) {
        const next = [...messages];
        next[index] = config;
        return next;
      }
      return messages;
    });
  }, []);

  const handleEmit = useCallback<MessageContainerCallback>(
    (type, config) => {
      switch (type) {
        case "show":
          add(config);
          break;
        case "close":
          remove(config);
          break;
        case "update":
          update(config);
          break;
        default:
      }
    },
    [add, remove, update]
  );

  useEffect(() => {
    messageManager.subscribe(name, handleEmit);

    return () => messageManager.unsubscribe(name);
  }, [handleEmit, name]);

  return useMountFloatLayer(
    <div className='absolute top-0 left-0 w-screen z-10 shadow-default'>
      <div className='absolute top-0 right-0 h-0'>
        <div className='flex flex-col items-end pt-[5.25rem] h-0'>
          <AnimatePresence>
            {messages.map((config, index) => (
              <motion.div
                key={config.tag}
                className={clsx("w-fit max-w-[min(calc(100vw_-_2rem),_25rem)]")}
                exit={
                  messages.length === 1 ? { x: "100%", opacity: 0 } : undefined
                }
                animate={{
                  opacity: 1,
                  x: `-1rem`,
                  y: `${index * 0.75}rem`,
                }}
                initial={{ opacity: 0.8, x: 0, y: `${index * 0.75}rem` }}
              >
                <MessageContent config={config} onClose={remove} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>,
    {
      mount: true,
    }
  );
}

export function GlobalMessageContainer() {
  return <MessageContainer name={globalContainerName} />;
}
