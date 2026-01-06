import type { RawQueueMessage } from './raw-queue-message.interface.js';

export interface QueueClient {
  receiveMessages(queueUrl: string): Promise<RawQueueMessage[]>;
  deleteMessage(queueUrl: string, ackToken: string): Promise<void>;
}
