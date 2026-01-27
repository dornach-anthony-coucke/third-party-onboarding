import { DynamicModule, Module, Provider } from '@nestjs/common';
import { AwsTransportConfigProvider } from './providers/aws-transport-config.provider.js';
import { AwsSqsClientProvider } from './providers/aws-sqs-client.provider.js';
import { AwsSnsClientProvider } from './providers/aws-sns-client.provider.js';
import { createPublisherProvider } from './providers/create-publisher.provider.js';
import type { PublisherConfig } from './types/publisher-config.interface.js';

/**
 * NestJS module that provides AWS messaging infrastructure (SQS/SNS clients and configuration).
 * 
 * This module is responsible for:
 * - Providing AWS clients and configuration (forRoot)
 * - Registering AWS publishers into PublisherRegistry (forFeature)
 * 
 * Separation of concerns:
 * - This module: AWS infrastructure + AWS publisher registration
 * - messaging-rabbitmq-nest (future): RabbitMQ infrastructure + RabbitMQ publisher registration
 * - messaging-core-nest-module: Core abstractions (PublisherRegistry, MessageRouter)
 * 
 * @example
 * // App that only consumes (no publishers needed):
 * @Module({
 *   imports: [
 *     MessagingCoreModule.forRoot(),
 *     MessagingAwsNestModule.forRoot(), // Just AWS clients
 *   ],
 *   providers: [MyConsumer]
 * })
 * export class ConsumerAppModule {}
 * 
 * @example
 * // App that publishes:
 * @Module({
 *   imports: [
 *     MessagingCoreModule.forRoot(),
 *     MessagingAwsNestModule.forRoot(), // AWS infrastructure
 *     MessagingAwsNestModule.forFeature([...]) // AWS publisher registration
 *   ]
 * })
 * export class PublisherAppModule {}
 */
@Module({})
export class MessagingAwsNestModule {
  /**
   * Provides AWS messaging infrastructure globally.
   * Use this in your root AppModule.
   * 
   * Provides:
   * - AWS_SQS_CLIENT_PROVIDER - SQS client for queues
   * - AWS_SNS_CLIENT_PROVIDER - SNS client for topics
   * - AWS_TRANSPORT_CONFIG - AWS configuration (region, account, endpoint)
   * 
   * Does NOT provide:
   * - Publishers (use forFeature() instead)
   * 
   * @returns DynamicModule with AWS infrastructure providers
   */
  static forRoot(): DynamicModule {
    return {
      module: MessagingAwsNestModule,
      providers: [
        AwsTransportConfigProvider,
        AwsSqsClientProvider,
        AwsSnsClientProvider,
      ],
      exports: [
        AwsTransportConfigProvider,
        AwsSqsClientProvider,
        AwsSnsClientProvider,
      ],
      global: true,
    };
  }

  /**
   * Registers AWS publishers into the PublisherRegistry.
   * Use this in modules that need to publish messages via AWS SQS/SNS.
   * 
   * Requires:
   * - MessagingCoreModule.forRoot() - Provides PublisherRegistry
   * - MessagingAwsNestModule.forRoot() - Provides AWS clients
   * 
   * @param publishers - Array of AWS publisher configurations
   * @returns DynamicModule with publisher registration providers
   * 
   * @example
   * MessagingAwsNestModule.forFeature([
   *   {
   *     key: 'company-registry',
   *     destination: 'COMPANY_REGISTRY_PUBLIC_COMMANDS_QUEUE',
   *     metadata: { transportType: 'sqs' }
   *   },
   *   {
   *     key: 'notifications',
   *     destination: 'NOTIFICATIONS_TOPIC',
   *     metadata: { transportType: 'sns' }
   *   }
   * ])
   */
  static forFeature(publishers: PublisherConfig[]): DynamicModule {
    const providers: Provider[] = publishers.map((config) =>
      createPublisherProvider(config)
    );

    return {
      module: MessagingAwsNestModule,
      providers,
    };
  }
}

