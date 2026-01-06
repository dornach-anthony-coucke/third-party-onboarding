import type { MessageEnvelope, MessageType, QueueClient, RawQueueMessage } from '../types';
import type { MessageRouter } from './message-router';

export abstract class AbstractQueueConsumer {
  constructor(
    protected readonly messageRouter: MessageRouter,
    protected readonly queueClient: QueueClient,
  ) {}

  abstract get queueName(): string;

  async poll(): Promise<void> {
    const messages = await this.queueClient.receiveMessages(this.queueName);
    for (const rawMessage of messages) {
      try {
        const envelope = this.parse(rawMessage);
        await this.messageRouter.dispatch(envelope);
        await this.ack(rawMessage);
      } catch (error) {
        await this.onError(error, rawMessage);
      }
    }
  }

  protected abstract onError(error: unknown, rawMessage: RawQueueMessage): void | Promise<void>;

  protected abstract parse(rawMessage: RawQueueMessage): MessageEnvelope<MessageType, unknown>;

  protected async ack(rawMessage: RawQueueMessage): Promise<void> {
    await this.queueClient.deleteMessage(this.queueName, rawMessage.ackToken);
  }
}
