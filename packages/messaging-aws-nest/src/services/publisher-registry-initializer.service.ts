import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
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
import { PUBLISHER_REGISTRY } from '@third-party-onboarding-manager/messaging-core-nest';
import type { PublisherRegistry } from '@third-party-onboarding-manager/messaging-core';
import { AWS_TRANSPORT_CONFIG } from '../tokens/aws-transport-config.token.js';
import { AWS_SQS_CLIENT_PROVIDER } from '../tokens/sqs-client.token.js';
import { AWS_SNS_CLIENT_PROVIDER } from '../tokens/sns-client.token.js';
import { PUBLISHER_CONFIGS } from '../tokens/publisher-configs.token.js';
import type { PublisherConfig } from '../types/publisher-config.interface.js';

/**
 * Service that initializes publishers in the PublisherRegistry during module initialization.
 * This is a cleaner alternative to using dynamic provider tokens.
 *
 * This implementation is AWS-specific and lives in messaging-aws-nest.
 * For RabbitMQ, a similar service would live in messaging-rabbitmq-nest.
 * For Kafka, it would live in messaging-kafka-nest.
 *
 * @example
 * // Module configuration
 * MessagingAwsNestModule.registerPublishers([
 *   {
 *     key: 'company-registry',
 *     destination: 'COMPANY_REGISTRY_QUEUE',
 *     metadata: { transportType: 'sqs' }
 *   }
 * ])
 */
@Injectable()
export class PublisherRegistryInitializer implements OnModuleInit {
  constructor(
    @Inject(AWS_SQS_CLIENT_PROVIDER)
    private readonly sqsClient: SQSClient,
    @Inject(AWS_SNS_CLIENT_PROVIDER)
    private readonly snsClient: SNSClient,
    @Inject(AWS_TRANSPORT_CONFIG)
    private readonly transportConfig: AwsMessagingConfig,
    private readonly configService: ConfigService,
    @Inject(PUBLISHER_REGISTRY)
    private readonly publisherRegistry: PublisherRegistry,
    @Inject(PUBLISHER_CONFIGS)
    private readonly publisherConfigs: PublisherConfig[],
  ) {}

  onModuleInit(): void {
    for (const config of this.publisherConfigs) {
      this.registerPublisher(config);
    }
  }

  private registerPublisher(config: PublisherConfig): void {
    // Extract transport type from metadata (defaults to 'sqs' for backward compatibility)
    const transportType = (config.metadata?.transportType as 'sqs' | 'sns') ?? 'sqs';

    // Get the queue/topic name - either directly from config.destination (if already resolved)
    // or by looking it up in ConfigService (for backward compatibility with env var names)
    let destinationName: string;
    try {
      // Try to get it from ConfigService first (backward compatible with env var names)
      destinationName = this.configService.getOrThrow(config.destination);
    } catch {
      // If that fails, assume destination is already the actual value
      destinationName = config.destination;
    }

    if (transportType === 'sqs') {
      const queueUrl = createQueueUrl(this.transportConfig, destinationName);
      this.publisherRegistry.register(config.key, new SqsPublisher(this.sqsClient, queueUrl));
    } else if (transportType === 'sns') {
      const topicArn = createTopicArn(this.transportConfig, destinationName);
      this.publisherRegistry.register(config.key, new SnsPublisher(this.snsClient, topicArn));
    } else {
      throw new Error(
        `Unsupported AWS transport type: ${transportType}. Supported types are 'sqs' and 'sns'.`,
      );
    }
  }
}
