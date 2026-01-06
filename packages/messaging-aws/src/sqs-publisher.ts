import { SendMessageCommand, type SQSClient } from '@aws-sdk/client-sqs';
import type {
  MessageEnvelope,
  MessagePublisher,
} from '@third-party-onboarding-manager/messaging-core';

export class SqsPublisher implements MessagePublisher {
  constructor(
    private readonly sqsClient: SQSClient,
    private readonly queueUrl: string,
  ) {}

  async publish<T>(envelope: MessageEnvelope<T>): Promise<void> {
    await this.sqsClient.send(
      new SendMessageCommand({
        QueueUrl: this.queueUrl,
        MessageBody: JSON.stringify(envelope),
        MessageAttributes: {
          type: { DataType: 'String', StringValue: envelope.type },
          version: { DataType: 'Number', StringValue: envelope.version?.toString() ?? '1' },
        },
      }),
    );
  }
}
