import { PublishCommand, type SNSClient } from '@aws-sdk/client-sns';
import type {
  MessageEnvelope,
  MessagePublisher,
} from '@third-party-onboarding-manager/messaging-core';

export class SnsPublisher implements MessagePublisher {
  constructor(
    private readonly snsCLient: SNSClient,
    private readonly topicArn: string,
  ) {}

  async publish<T>(envelope: MessageEnvelope<T>): Promise<void> {
    await this.snsCLient.send(
      new PublishCommand({
        TopicArn: this.topicArn,
        Message: JSON.stringify(envelope),
        MessageAttributes: {
          type: {
            DataType: 'String',
            StringValue: envelope.type,
          },
          version: {
            DataType: 'Number',
            StringValue: envelope.version?.toString() ?? '1',
          },
        },
      }),
    );
  }
}
