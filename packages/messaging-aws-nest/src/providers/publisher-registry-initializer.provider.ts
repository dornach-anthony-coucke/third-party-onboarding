import type { SQSClient } from '@aws-sdk/client-sqs';
import {
  createQueueUrl,
  SqsPublisher,
  type AwsMessagingConfig,
} from '@third-party-onboarding-manager/messaging-aws';
import { ConfigService } from '@nestjs/config';
import { AWS_TRANSPORT_CONFIG } from '../tokens/aws-transport-config.token.js';
import { AWS_SQS_CLIENT_PROVIDER } from '../tokens/sqs-client.token.js';
import { PUBLISHER_REGISTRY } from '@third-party-onboarding-manager/messaging-core-nest-module';
import type { PublisherRegistry } from '@third-party-onboarding-manager/messaging-core';

/**
 * Provider that registers all bounded context publishers into the PublisherRegistry
 * This eliminates the need for individual publisher tokens and allows dynamic publisher lookup
 */
export const publisherRegistryInitializerProvider = {
  provide: 'PUBLISHER_REGISTRY_INITIALIZER',
  useFactory: (
    sqsClient: SQSClient,
    transportConfig: AwsMessagingConfig,
    configService: ConfigService,
    publisherRegistry: PublisherRegistry,
  ) => {
    // Register onboarding-manager internal commands publisher
    const onboardingQueueUrl = createQueueUrl(
      transportConfig,
      configService.getOrThrow('ONBOARDING_MANAGER_INTERNAL_COMMANDS_QUEUE'),
    );
    publisherRegistry.register(
      'third-party-onboarding-manager',
      new SqsPublisher(sqsClient, onboardingQueueUrl),
    );

    // Register company-registry public commands publisher
    const companyQueueUrl = createQueueUrl(
      transportConfig,
      configService.getOrThrow('COMPANY_REGISTRY_PUBLIC_COMMANDS_QUEUE'),
    );
    publisherRegistry.register('company-registry', new SqsPublisher(sqsClient, companyQueueUrl));

    // Register account-registry public commands publisher
    const accountQueueUrl = createQueueUrl(
      transportConfig,
      configService.getOrThrow('ACCOUNT_REGISTRY_PUBLIC_COMMANDS_QUEUE'),
    );
    publisherRegistry.register('account-registry', new SqsPublisher(sqsClient, accountQueueUrl));

    return publisherRegistry;
  },
  inject: [AWS_SQS_CLIENT_PROVIDER, AWS_TRANSPORT_CONFIG, ConfigService, PUBLISHER_REGISTRY],
};
