import type { MessageType as MessageTypeBase } from './message-type.type.js';

export interface MessageEnvelope<MessageType extends MessageTypeBase, PayloadType = unknown> {
  readonly id: string;
  readonly type: string;
  readonly version?: number;
  readonly destinationBoundedContext: MessageType extends 'COMMAND' ? string : undefined;
  readonly payload: PayloadType;
}
