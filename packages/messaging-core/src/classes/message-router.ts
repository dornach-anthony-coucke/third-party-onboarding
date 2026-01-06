import { ListenerNotFoundError } from '../errors/listener-not-found.error.js';
import type { MessageEnvelope } from '../types/message-envelope.interface.js';
import type { MessageListener } from '../types/message-listener.interface.js';
import type { MessageType } from '../types/message-type.type.js';

export class MessageRouter {
  private listeners = new Map<string, MessageListener<unknown>>();

  constructor(listeners: MessageListener<unknown>[]) {
    listeners.forEach((listener) => this.listeners.set(listener.messageType, listener));
  }

  async dispatch<PayloadType>(message: MessageEnvelope<MessageType, PayloadType>) {
    const listener = this.listeners.get(message.type);
    if (!listener) throw new ListenerNotFoundError(message.type);
    await listener.handle(message);
  }
}
