import type { AwsMessagingConfig } from '@third-party-onboarding-manager/messaging-aws';
import { AWS_TRANSPORT_CONFIG } from '../tokens/aws-transport-config.token';
import { AWS_SNS_CLIENT_PROVIDER } from '../tokens/sns-client.token';
import { SNSClient } from '@aws-sdk/client-sns';

export const AwsSnsClientProvider = {
  provide: AWS_SNS_CLIENT_PROVIDER,
  useFactory: (awsMessagingConfig: AwsMessagingConfig) => {
    return new SNSClient(awsMessagingConfig);
  },
  inject: [AWS_TRANSPORT_CONFIG],
};
