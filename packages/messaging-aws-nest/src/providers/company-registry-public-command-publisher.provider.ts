import type { SQSClient } from '@aws-sdk/client-sqs';
import { COMPANY_REGISTRY_PUBLIC_COMMAND_PUBLISHER } from '../tokens/company-registry-public-command-publisher.token';
import {
  createQueueUrl,
  SqsPublisher,
  type AwsMessagingConfig,
} from '@third-party-onboarding-manager/messaging-aws';
import { ConfigService } from '@nestjs/config';
import { AWS_TRANSPORT_CONFIG } from '../tokens/aws-transport-config.token';
import { AWS_SQS_CLIENT_PROVIDER } from '../tokens/sqs-client.token';

export const companyRegistryPublicCommandPublisherProvider = {
  provide: COMPANY_REGISTRY_PUBLIC_COMMAND_PUBLISHER,
  useFactory: (
    sqsClient: SQSClient,
    transportConfig: AwsMessagingConfig,
    configService: ConfigService,
  ) => {
    const queueUrl = createQueueUrl(
      transportConfig,
      configService.getOrThrow('COMPANY_REGISTRY_PUBLIC_COMMANDS_QUEUE'),
    );

    return new SqsPublisher(sqsClient, queueUrl);
  },
  inject: [AWS_SQS_CLIENT_PROVIDER, AWS_TRANSPORT_CONFIG, ConfigService],
};
