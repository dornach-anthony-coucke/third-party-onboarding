import type { Provider } from '@nestjs/common';
import type { SQSClient } from '@aws-sdk/client-sqs';
import type { SNSClient } from '@aws-sdk/client-sns';
import { ConfigService } from '@nestjs/config';
import {
  createQueueUrl,
  createTopicArn,
  SqsPublisher,
  SnsPublisher,
  type AwsMessagingConfig,
} from '@third-party-onboarding-manager/messaging-aws';
import { PUBLISHER_REGISTRY } from '@third-party-onboarding-manager/messaging-core-nest-module';
import type { PublisherRegistry } from '@third-party-onboarding-manager/messaging-core';
import {
  AWS_TRANSPORT_CONFIG,
  AWS_SQS_CLIENT_PROVIDER,
  AWS_SNS_CLIENT_PROVIDER,
} from '@third-party-onboarding-manager/messaging-aws-nest';
import type { PublisherConfig } from './publisher-config.interface.js';

/**
 * Creates a provider that registers a publisher into the PublisherRegistry
 * This allows on-demand registration of publishers in feature modules
 * 
 * @param config - Configuration for the publisher to create and register
 * @returns NestJS Provider that performs the registration
 */
export function createPublisherProvider(config: PublisherConfig): Provider {
  return {
    provide: `PUBLISHER_INITIALIZER_${config.key}`,
    useFactory: (
      sqsClient: SQSClient,
      snsClient: SNSClient,
      transportConfig: AwsMessagingConfig,
      configService: ConfigService,
      publisherRegistry: PublisherRegistry,
    ) => {
      if (config.type === 'sqs') {
        const queueUrl = createQueueUrl(
          transportConfig,
          configService.getOrThrow(config.queueName),
        );
        publisherRegistry.register(config.key, new SqsPublisher(sqsClient, queueUrl));
      } else if (config.type === 'sns') {
        const topicArn = createTopicArn(
          transportConfig,
          configService.getOrThrow(config.queueName),
        );
        publisherRegistry.register(config.key, new SnsPublisher(snsClient, topicArn));
      } else {
        throw new Error(
          `Unsupported publisher type: ${config.type}. Supported types are 'sqs' and 'sns'.`
        );
      }

      // Return a marker that the publisher was initialized
      return { key: config.key, type: config.type, initialized: true };
    },
    inject: [
      AWS_SQS_CLIENT_PROVIDER,
      AWS_SNS_CLIENT_PROVIDER,
      AWS_TRANSPORT_CONFIG,
      ConfigService,
      PUBLISHER_REGISTRY,
    ],
  };
}
