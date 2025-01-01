import { MessageConfig } from './config';

export type MessageEmitType = 'close' | 'show' | 'update';

export type MessageContainerCallback = (type: MessageEmitType, config: MessageConfig) => void;

type MessageContainerRegistry = Record<string, MessageContainerCallback>;

export class MessageManager {
  registry: MessageContainerRegistry = {};

  subscribe(name: string, callback: MessageContainerCallback) {
    if (this.registry[name]) {
      console.log(`container ${name} has already registered`);
    } else {
      this.registry[name] = callback;
    }
  }

  unsubscribe(name: string) {
    if (this.registry[name]) {
      delete this.registry[name];
    }
  }

  emit(type: MessageEmitType, config: MessageConfig) {
    this.registry[config.container]?.(type, config);
  }

  broadcast(type: MessageEmitType, config: MessageConfig, except: string[] = []) {
    for (const container in this.registry) {
      if (!except.includes(container)) {
        this.registry[container](type, config);
      }
    }
  }
}

export const messageManager = new MessageManager();
