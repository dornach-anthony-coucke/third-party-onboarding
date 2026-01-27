import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import type { SQSClient } from '@aws-sdk/client-sqs';
import type { SNSClient } from '@aws-sdk/client-sns';
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
import {
  ONBOARDING_MANAGER_INTERNAL_COMMANDS_QUEUE_NAME,
  COMPANY_REGISTRY_PUBLIC_COMMANDS_QUEUE_NAME,
  ACCOUNT_REGISTRY_PUBLIC_COMMANDS_QUEUE_NAME,
} from '../tokens/queue-names.token.js';

/**
 * Service that initializes publishers in the PublisherRegistry during module initialization.
 * This is a cleaner alternative to using dynamic provider tokens.
 *
 * This implementation is AWS-specific and lives in messaging-aws-nest.
 * For RabbitMQ, a similar service would live in messaging-rabbitmq-nest.
 * For Kafka, it would live in messaging-kafka-nest.
 *
 * Queue names are injected as providers that use ConfigService to retrieve
 * configuration values, making the code cleaner and more testable.
 *
 * @example
 * // Module configuration
 * MessagingAwsNestModule.registerPublishers([
 *   {
 *     key: 'company-registry',
 *     destination: COMPANY_REGISTRY_PUBLIC_COMMANDS_QUEUE_NAME,
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
    @Inject(PUBLISHER_REGISTRY)
    private readonly publisherRegistry: PublisherRegistry,
    @Inject(PUBLISHER_CONFIGS)
    private readonly publisherConfigs: PublisherConfig[],
    @Inject(ONBOARDING_MANAGER_INTERNAL_COMMANDS_QUEUE_NAME)
    private readonly onboardingManagerInternalCommandsQueueName: string,
    @Inject(COMPANY_REGISTRY_PUBLIC_COMMANDS_QUEUE_NAME)
    private readonly companyRegistryPublicCommandsQueueName: string,
    @Inject(ACCOUNT_REGISTRY_PUBLIC_COMMANDS_QUEUE_NAME)
    private readonly accountRegistryPublicCommandsQueueName: string,
  ) {}

  onModuleInit(): void {
    for (const config of this.publisherConfigs) {
      this.registerPublisher(config);
    }
  }

  private registerPublisher(config: PublisherConfig): void {
    // Extract transport type from metadata (defaults to 'sqs' for backward compatibility)
    const transportType = (config.metadata?.transportType as 'sqs' | 'sns') ?? 'sqs';

    // Resolve queue name from injected token
    let queueName: string;
    switch (config.destination) {
      case ONBOARDING_MANAGER_INTERNAL_COMMANDS_QUEUE_NAME:
        queueName = this.onboardingManagerInternalCommandsQueueName;
        break;
      case COMPANY_REGISTRY_PUBLIC_COMMANDS_QUEUE_NAME:
        queueName = this.companyRegistryPublicCommandsQueueName;
        break;
      case ACCOUNT_REGISTRY_PUBLIC_COMMANDS_QUEUE_NAME:
        queueName = this.accountRegistryPublicCommandsQueueName;
        break;
      default:
        // If destination is not a known token, use it directly (backward compatibility)
        queueName = config.destination;
    }

    if (transportType === 'sqs') {
      const queueUrl = createQueueUrl(this.transportConfig, queueName);
      this.publisherRegistry.register(config.key, new SqsPublisher(this.sqsClient, queueUrl));
    } else if (transportType === 'sns') {
      const topicArn = createTopicArn(this.transportConfig, queueName);
      this.publisherRegistry.register(config.key, new SnsPublisher(this.snsClient, topicArn));
    } else {
      throw new Error(
        `Unsupported AWS transport type: ${transportType}. Supported types are 'sqs' and 'sns'.`,
      );
    }
  }
}
