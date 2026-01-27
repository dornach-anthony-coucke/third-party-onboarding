import { DynamicModule, Module } from '@nestjs/common';
import { createPublisherProvider } from './create-publisher.provider.js';
import type { PublisherConfig } from './publisher-config.interface.js';

/**
 * Module for registering message publishers into the PublisherRegistry.
 * 
 * This module is separate from messaging infrastructure (AWS, NATS, Kafka, etc.)
 * to maintain clean separation of concerns:
 * - Apps that only consume messages don't need this module
 * - Apps that publish messages use forFeature() to register only needed publishers
 * - Keeps the door open for swapping transport implementations (AWS → NATS, Kafka, etc.)
 * 
 * @example
 * // In an app that publishes messages:
 * @Module({
 *   imports: [
 *     MessagingCoreModule.forRoot(), // Provides PublisherRegistry
 *     MessagingAwsNestModule.forRoot(), // Provides AWS infrastructure
 *     MessagingPublishersModule.forFeature([ // Register publishers
 *       { key: 'company-registry', queueName: 'COMPANY_QUEUE', type: 'sqs' }
 *     ])
 *   ]
 * })
 * export class AppModule {}
 * 
 * @example
 * // In an app that only consumes messages (NO publishers needed):
 * @Module({
 *   imports: [
 *     MessagingCoreModule.forRoot(),
 *     MessagingAwsNestModule.forRoot(), // Only needs AWS clients for consumers
 *     // NO MessagingPublishersModule - this app doesn't publish!
 *   ]
 * })
 * export class ConsumerAppModule {}
 */
@Module({})
export class MessagingPublishersModule {
  /**
   * Register specific publishers into the PublisherRegistry.
   * Only import this in modules that actually need to publish messages.
   * 
   * Requires:
   * - MessagingCoreModule.forRoot() for PublisherRegistry
   * - MessagingAwsNestModule.forRoot() (or other transport) for clients
   * 
   * @param publishers - Array of publisher configurations
   * @returns DynamicModule with publisher registration providers
   * 
   * @example
   * MessagingPublishersModule.forFeature([
   *   {
   *     key: 'company-registry',
   *     queueName: 'COMPANY_REGISTRY_PUBLIC_COMMANDS_QUEUE',
   *     type: 'sqs'
   *   },
   *   {
   *     key: 'notifications',
   *     queueName: 'NOTIFICATIONS_TOPIC',
   *     type: 'sns'
   *   }
   * ])
   */
  static forFeature(publishers: PublisherConfig[]): DynamicModule {
    const providers = publishers.map((config) => createPublisherProvider(config));

    return {
      module: MessagingPublishersModule,
      providers,
    };
  }
}
