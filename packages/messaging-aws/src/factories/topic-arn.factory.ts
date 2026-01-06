import type { AwsMessagingConfig } from '../types/aws-messaging-config.interface.js';

export function createTopicArn(awsMessagingConfig: AwsMessagingConfig, topicName: string) {
  return `arn:aws:sns:${awsMessagingConfig.region}:${awsMessagingConfig.accountId}:${topicName}`;
}
