/* eslint-disable prettier/prettier */
import { SQSClient } from '@aws-sdk/client-sqs';
import { AWS_SQS_CLIENT_PROVIDER } from '../tokens/sqs-client.token';
import { SqsQueueClient, type AwsMessagingConfig } from '@third-party-onboarding-manager/messaging-aws';
import { AWS_TRANSPORT_CONFIG } from '../tokens/aws-transport-config.token';

export const AwsSqsClientProvider = {
  provide: AWS_SQS_CLIENT_PROVIDER,
  useFactory: (awsMessagingConfig: AwsMessagingConfig) => {
    const sqsClient = new SQSClient(awsMessagingConfig);
    return new SqsQueueClient(sqsClient);
  },
  inject: [AWS_TRANSPORT_CONFIG],
};
