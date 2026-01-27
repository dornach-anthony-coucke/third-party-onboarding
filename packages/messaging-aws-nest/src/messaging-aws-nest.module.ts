import { DynamicModule, Module } from '@nestjs/common';
import type { PublisherConfig } from '@third-party-onboarding-manager/messaging-core-nest';
import { AwsTransportConfigProvider } from './providers/aws-transport-config.provider.js';
import { AwsSqsClientProvider } from './providers/aws-sqs-client.provider.js';
import { AwsSnsClientProvider } from './providers/aws-sns-client.provider.js';
import { PublisherRegistryInitializer } from './services/publisher-registry-initializer.service.js';
import { PUBLISHER_CONFIGS } from './tokens/publisher-configs.token.js';

/**
 * NestJS module for AWS messaging infrastructure (SQS, SNS).
 * 
 * Provides AWS transport implementation for the messaging system with support for:
 * - SQS (Simple Queue Service) for queue-based messaging
 * - SNS (Simple Notification Service) for pub/sub messaging
 * 
 * @example Basic setup
 * ```typescript
 * @Module({
 *   imports: [
 *     MessagingCoreModule.forRoot(),
 *     MessagingAwsNestModule.forRoot(),
 *     MessagingAwsNestModule.registerPublishers([...])
 *   ]
 * })
 * export class AppModule {}
 * ```
 */
@Module({})
export class MessagingAwsNestModule {
  /**
   * Initialize AWS messaging infrastructure (clients, configuration).
   * 
   * This provides:
   * - AWS SQS Client
   * - AWS SNS Client
   * - AWS transport configuration
   * 
   * Should be called once in your application, typically in the root module.
   * The module is registered as global for convenience.
   */
  static forRoot(): DynamicModule {
    return {
      module: MessagingAwsNestModule,
      providers: [AwsTransportConfigProvider, AwsSqsClientProvider, AwsSnsClientProvider],
      exports: [AwsTransportConfigProvider, AwsSqsClientProvider, AwsSnsClientProvider],
      global: true,
    };
  }

  /**
   * Register publishers using simple, declarative configuration (recommended).
   * 
   * Use this for the common case where queue/topic names come from environment variables.
   * The module will automatically resolve values from ConfigService.
   * 
   * @example
   * ```typescript
   * MessagingAwsNestModule.registerPublishers([
   *   {
   *     key: 'company-registry',
   *     destinationEnvironmentKey: 'COMPANY_REGISTRY_PUBLIC_COMMANDS_QUEUE',
   *     metadata: { transportType: 'sqs' }
   *   },
   *   {
   *     key: 'notifications',
   *     destinationEnvironmentKey: 'NOTIFICATIONS_TOPIC',
   *     metadata: { transportType: 'sns' }
   *   }
   * ])
   * ```
   * 
   * @param publisherConfigurations - Array of publisher configurations with env var keys
   */
  static registerPublishers(publisherConfigurations: PublisherConfig[]): DynamicModule {
    return {
      module: MessagingAwsNestModule,
      providers: [
        {
          provide: PUBLISHER_CONFIGS,
          useValue: publisherConfigurations,
        },
        PublisherRegistryInitializer,
      ],
    };
  }

  /**
   * Register publishers using advanced async configuration (escape hatch).
   * 
   * Use this for complex scenarios where you need full control over configuration resolution:
   * - Remote configuration (API, database)
   * - Complex transformations
   * - Dynamic runtime configuration
   * - Testing with mock values
   * 
   * @example
   * ```typescript
   * MessagingAwsNestModule.registerPublishersAsync({
   *   useFactory: async (configService: ConfigService, remoteConfig: RemoteConfigService) => {
   *     const queues = await remoteConfig.getQueues();
   *     return [{
   *       key: 'company-registry',
   *       destination: queues.companyRegistry,
   *       metadata: { transportType: 'sqs' }
   *     }];
   *   },
   *   inject: [ConfigService, RemoteConfigService]
   * })
   * ```
   * 
   * @param options - Async configuration options with useFactory and inject
   */
  static registerPublishersAsync(options: {
    useFactory: (...args: unknown[]) => PublisherConfig[] | Promise<PublisherConfig[]>;
    inject?: unknown[];
  }): DynamicModule {
    return {
      module: MessagingAwsNestModule,
      providers: [
        {
          provide: PUBLISHER_CONFIGS,
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
        PublisherRegistryInitializer,
      ],
    };
  }
}
