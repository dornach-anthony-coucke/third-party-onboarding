import type { AwsMessagingConfig } from '../types/aws-messaging-config.interface.js';

export function createQueueUrl(awsMessagingConfig: AwsMessagingConfig, queueName: string) {
  return `${awsMessagingConfig.endpoint}/${awsMessagingConfig.accountId}/${queueName}`;
}
