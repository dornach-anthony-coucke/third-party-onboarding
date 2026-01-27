import { DynamicModule, Module, Provider } from '@nestjs/common';
import { companyRegistryPublicCommandPublisherProvider } from './providers/company-registry-public-command-publisher.provider.js';
import { accountRegistryPublicCommandPublisherProvider } from './providers/account-registry-public-command-publisher.provider.js';
import { AwsTransportConfigProvider } from './providers/aws-transport-config.provider.js';
import { AwsSqsClientProvider } from './providers/aws-sqs-client.provider.js';
import { AwsSnsClientProvider } from './providers/aws-sns-client.provider.js';
import { onboardingManagerInternalCommandPublisherProvider } from './providers/onboarding-manager-internal-command-publisher.provider.js';
import { publisherRegistryInitializerProvider } from './providers/publisher-registry-initializer.provider.js';
import { createPublisherProvider } from './providers/create-publisher.provider.js';
import type { PublisherConfig } from './types/publisher-config.interface.js';

/**
 * Static module for backwards compatibility
 * @deprecated Use forRoot() or forFeature() instead for better decoupling
 */
@Module({
  providers: [
    // Legacy individual publisher providers (kept for backwards compatibility)
    companyRegistryPublicCommandPublisherProvider,
    accountRegistryPublicCommandPublisherProvider,
    onboardingManagerInternalCommandPublisherProvider,
    
    // Core AWS clients
    AwsTransportConfigProvider,
    AwsSqsClientProvider,
    AwsSnsClientProvider,
    
    // New PublisherRegistry initializer
    publisherRegistryInitializerProvider,
  ],
  exports: [
    // Legacy exports (kept for backwards compatibility)
    companyRegistryPublicCommandPublisherProvider,
    accountRegistryPublicCommandPublisherProvider,
    onboardingManagerInternalCommandPublisherProvider,
    
    // Core AWS clients
    AwsSqsClientProvider,
    AwsSnsClientProvider,
    AwsTransportConfigProvider,
    
    // New PublisherRegistry initializer
    publisherRegistryInitializerProvider,
  ],
})
export class MessagingAwsNestModule {
  /**
   * Creates a module that provides AWS messaging infrastructure without registering any publishers.
   * Use this in your root AppModule to make AWS clients available globally.
   * Then use forFeature() in feature modules to register specific publishers where needed.
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
   * Creates a module that registers specific publishers into the PublisherRegistry.
   * Use this in feature modules to register only the publishers you need.
   * Requires MessagingCoreModule.forRoot() to be imported first (provides PublisherRegistry).
   * 
   * @param publishers - Array of publisher configurations to register
   * @returns DynamicModule with publisher registration providers
   * 
   * @example
   * // In a feature module:
   * @Module({
   *   imports: [
   *     MessagingAwsNestModule.forFeature([
   *       {
   *         key: 'company-registry',
   *         queueName: 'COMPANY_REGISTRY_PUBLIC_COMMANDS_QUEUE',
   *         type: 'sqs'
   *       }
   *     ])
   *   ]
   * })
   * export class MyFeatureModule {}
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
