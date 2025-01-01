import { ReactNode } from 'react';

import { createMessageConfig, MessageConfig, MessageOption, MessageUpdateOption } from './config';
import { messageManager } from './manager';

export function message(content: ReactNode, option: MessageOption = {}) {
  const config = createMessageConfig({ ...option, content });

  messageManager.emit('show', config);
  messageManager.broadcast('close', config, [config.container]);

  const close = () => messageManager.emit('close', config);

  const trigger = (config: MessageConfig) => {
    if (config.duration !== Infinity && typeof config.duration === 'number' && !Number.isNaN(config.duration)) {
      setTimeout(close, config.duration);
    }
  };

  const update = (option: MessageUpdateOption) => {
    const next = { ...config, ...option };
    messageManager.emit('update', next);
    trigger(next);
  };

  trigger(config);

  return {
    close,
    update,
  };
}
