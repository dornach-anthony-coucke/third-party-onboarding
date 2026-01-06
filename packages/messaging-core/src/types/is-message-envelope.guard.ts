import type { MessageEnvelope } from './message-envelope.interface.js';
import type { MessageType } from './message-type.type.js';

export function isMessageEnvelope(obj: unknown): obj is MessageEnvelope<MessageType, unknown> {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const record = obj as Record<string, unknown>;

  return typeof record.type === 'string' && record.payload !== undefined;
}
