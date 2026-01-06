import type { MessageEnvelope } from './message-envelope.interface';
import type { MessageType } from './message-type.type.js';

export interface MessagePublisher {
  publish<PayloadType>(message: MessageEnvelope<MessageType, PayloadType>): Promise<void>;
}
