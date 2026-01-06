import {
  DeleteMessageCommand,
  type MessageAttributeValue,
  ReceiveMessageCommand,
  type SQSClient,
} from '@aws-sdk/client-sqs';
import type { QueueClient, RawQueueMessage } from '@third-party-onboarding-manager/messaging-core';

export class SqsQueueClient implements QueueClient {
  constructor(private readonly sqs: SQSClient) {}

  async receiveMessages(queueUrl: string): Promise<RawQueueMessage[]> {
    const response = await this.sqs.send(
      new ReceiveMessageCommand({
        QueueUrl: queueUrl,
        MaxNumberOfMessages: 10,
        WaitTimeSeconds: 20,
        MessageAttributeNames: ['All'],
      }),
    );

    if (!response.Messages) {
      return [];
    }

    return response.Messages.map((message) => ({
      id: message.MessageId!,
      body: message.Body!,
      ackToken: message.ReceiptHandle!,
      attributes: this.mapAttributes(message.MessageAttributes),
    }));
  }

  private mapAttributes(
    attributes?: Record<string, MessageAttributeValue>,
  ): Record<string, string> | undefined {
    if (!attributes) return undefined;

    const parsedAttributes: Record<string, string> = {};

    for (const [key, value] of Object.entries(attributes)) {
      if (value.StringValue !== undefined) {
        parsedAttributes[key] = value.StringValue;
      }
    }

    return parsedAttributes;
  }

  async deleteMessage(queueUrl: string, ackToken: string): Promise<void> {
    await this.sqs.send(
      new DeleteMessageCommand({
        QueueUrl: queueUrl,
        ReceiptHandle: ackToken,
      }),
    );
  }
}
