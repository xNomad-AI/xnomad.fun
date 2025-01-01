import { useMemo } from "react";

import { IconCheckCircle, IconClose, IconCloseCircle, IconInfo } from "../icon";
import { MessageConfig } from "./config";
import { Spin } from "../spin";

type Props = {
  config: MessageConfig;
  onClose?: (config: MessageConfig) => void;
};

export function MessageContent(props: Props) {
  const { config, onClose } = props;

  const handleClose = () => {
    onClose?.(config);
  };

  const typeIcon = useMemo(() => {
    switch (config.type) {
      case "error":
        return <IconCloseCircle className='text-red text-size-24 shrink-0' />;
      case "success":
        return <IconCheckCircle className='text-green text-size-24 shrink-0' />;
      case "loading":
        return <Spin className='text-text1 text-size-24 shrink-0' />;
      case "warning":
        return <IconInfo className='text-yellow text-size-24 shrink-0' />;
      case "plain":
      default:
        return null;
    }
  }, [config.type]);

  return (
    <div className='p-12 w-fit rounded-6 shadow-base bg-surface dark:bg-dividing text-text1 flex items-center gap-12 max-w-full min-w-0'>
      {typeIcon}
      {config.suffix}
      <div className='select-none grow shrink break-words text-left min-w-0'>
        {config.content}
      </div>
      {config.closable ? (
        <IconClose
          className='text-size-20 cursor-pointer shrink-0'
          onClick={handleClose}
        />
      ) : null}
      {config.action}
    </div>
  );
}
