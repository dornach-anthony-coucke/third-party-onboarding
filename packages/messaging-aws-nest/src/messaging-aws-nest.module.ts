import { DynamicModule, Module } from '@nestjs/common';
import { AwsTransportConfigProvider } from './providers/aws-transport-config.provider.js';
import { AwsSqsClientProvider } from './providers/aws-sqs-client.provider.js';
import { AwsSnsClientProvider } from './providers/aws-sns-client.provider.js';

/**
 * NestJS module that provides AWS messaging infrastructure (SQS/SNS clients and configuration).
 * 
 * This module is ONLY responsible for providing AWS clients and configuration.
 * It does NOT register publishers - use @third-party-onboarding-manager/messaging-publishers-nest for that.
 * 
 * Separation of concerns:
 * - This module: AWS infrastructure (clients, config)
 * - messaging-publishers-nest: Publisher registration
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
 * // App that publishes (use messaging-publishers-nest):
 * @Module({
 *   imports: [
 *     MessagingCoreModule.forRoot(),
 *     MessagingAwsNestModule.forRoot(), // AWS infrastructure
 *     MessagingPublishersModule.forFeature([...]) // Publisher registration
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
   * - Publishers (use MessagingPublishersModule.forFeature() instead)
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
}

