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
import { AWS_TRANSPORT_CONFIG } from '../tokens/aws-transport-config.token.js';
import { AWS_SQS_CLIENT_PROVIDER } from '../tokens/sqs-client.token.js';
import { AWS_SNS_CLIENT_PROVIDER } from '../tokens/sns-client.token.js';
import type { PublisherConfig } from '../types/publisher-config.interface.js';

/**
 * Creates a provider that registers an AWS publisher into the PublisherRegistry.
 * This allows on-demand registration of publishers in feature modules.
 * 
 * This implementation is AWS-specific and lives in messaging-aws-nest.
 * For RabbitMQ, a similar factory would live in messaging-rabbitmq-nest.
 * For Kafka, it would live in messaging-kafka-nest.
 * 
 * @param config - Transport-agnostic publisher configuration
 * @returns NestJS Provider that performs the registration
 * 
 * @example
 * // SQS publisher
 * createPublisherProvider({
 *   key: 'company-registry',
 *   destination: 'COMPANY_REGISTRY_QUEUE',
 *   metadata: { transportType: 'sqs' }
 * })
 * 
 * @example
 * // SNS publisher
 * createPublisherProvider({
 *   key: 'notifications',
 *   destination: 'NOTIFICATIONS_TOPIC',
 *   metadata: { transportType: 'sns' }
 * })
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
      // Extract transport type from metadata (defaults to 'sqs' for backward compatibility)
      const transportType = (config.metadata?.transportType as 'sqs' | 'sns') ?? 'sqs';
      
      if (transportType === 'sqs') {
        const queueUrl = createQueueUrl(
          transportConfig,
          configService.getOrThrow(config.destination),
        );
        publisherRegistry.register(config.key, new SqsPublisher(sqsClient, queueUrl));
      } else if (transportType === 'sns') {
        const topicArn = createTopicArn(
          transportConfig,
          configService.getOrThrow(config.destination),
        );
        publisherRegistry.register(config.key, new SnsPublisher(snsClient, topicArn));
      } else {
        throw new Error(
          `Unsupported AWS transport type: ${transportType}. Supported types are 'sqs' and 'sns'.`
        );
      }

      // Return a marker that the publisher was initialized
      return { key: config.key, transportType, initialized: true };
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
