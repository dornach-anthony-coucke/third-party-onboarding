import { Injectable, OnModuleInit, Inject, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { SQSClient } from '@aws-sdk/client-sqs';
import type { SNSClient } from '@aws-sdk/client-sns';
import type { PublisherConfig } from '@third-party-onboarding-manager/messaging-core-nest';
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

/**
 * Service that initializes AWS publishers in the PublisherRegistry during module initialization.
 *
 * This implementation is AWS-specific and lives in messaging-aws-nest.
 * Other transports would have their own implementations:
 * - RabbitMQ: messaging-rabbitmq-nest/PublisherRegistryInitializer
 * - Kafka: messaging-kafka-nest/PublisherRegistryInitializer
 * - NATS: messaging-nats-nest/PublisherRegistryInitializer
 *
 * Supports two configuration modes:
 *
 * **Simple (recommended)**: Use `destinationEnvironmentKey` for declarative config
 * @example
 * MessagingAwsNestModule.registerPublishers([
 *   {
 *     key: 'company-registry',
 *     destinationEnvironmentKey: 'COMPANY_REGISTRY_QUEUE',
 *     metadata: { transportType: 'sqs' }
 *   }
 * ])
 *
 * **Advanced**: Use `registerPublishersAsync` with `useFactory` for complex scenarios
 * @example
 * MessagingAwsNestModule.registerPublishersAsync({
 *   useFactory: (configService: ConfigService) => [
 *     {
 *       key: 'company-registry',
 *       destination: configService.getOrThrow('COMPANY_REGISTRY_QUEUE'),
 *       metadata: { transportType: 'sqs' }
 *     }
 *   ],
 *   inject: [ConfigService]
 * })
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
    @Inject(PUBLISHER_REGISTRY)
    private readonly publisherRegistry: PublisherRegistry,
    @Inject(PUBLISHER_CONFIGS)
    private readonly publisherConfigs: PublisherConfig[],
    @Optional()
    private readonly configService?: ConfigService,
  ) {}

  onModuleInit(): void {
    for (const config of this.publisherConfigs) {
      this.registerPublisher(config);
    }
  }

  private registerPublisher(config: PublisherConfig): void {
    // Extract transport type from metadata (defaults to 'sqs' for backward compatibility)
    const transportType = (config.metadata?.transportType as 'sqs' | 'sns') ?? 'sqs';

    // Resolve the destination name from either destinationEnvironmentKey or destination
    const destinationName = this.resolveDestination(config);

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

  private resolveDestination(config: PublisherConfig): string {
    // Validate that exactly one of destination or destinationEnvironmentKey is provided
    const hasDestination = config.destination !== undefined && config.destination.trim() !== '';
    const hasEnvKey =
      config.destinationEnvironmentKey !== undefined &&
      config.destinationEnvironmentKey.trim() !== '';

    if (hasDestination && hasEnvKey) {
      throw new Error(
        `Publisher config for key '${config.key}' has both 'destination' and 'destinationEnvironmentKey'. ` +
          `Provide only one.`,
      );
    }

    if (!hasDestination && !hasEnvKey) {
      throw new Error(
        `Publisher config for key '${config.key}' must provide either 'destination' or 'destinationEnvironmentKey'.`,
      );
    }

    // If destination is provided directly, use it (advanced mode)
    if (hasDestination) {
      return config.destination!.trim();
    }

    // If destinationEnvironmentKey is provided, resolve from ConfigService (simple mode)
    if (!this.configService) {
      throw new Error(
        `Publisher config for key '${config.key}' uses 'destinationEnvironmentKey' but ConfigService is not available. ` +
          `Make sure ConfigModule is imported in your application module.`,
      );
    }

    const envValue = this.configService.getOrThrow<string>(config.destinationEnvironmentKey!);
    return envValue;
  }
}
