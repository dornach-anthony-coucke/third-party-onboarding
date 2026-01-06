import type { MessageEnvelope } from './message-envelope.interface.js';
import type { MessageType } from './message-type.type.js';

export interface MessageListener<PayloadType> {
  readonly messageType: string;
  handle(message: MessageEnvelope<MessageType, PayloadType>): Promise<void>;
}
