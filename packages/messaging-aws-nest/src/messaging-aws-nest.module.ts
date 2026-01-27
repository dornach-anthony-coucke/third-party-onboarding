import { Module } from '@nestjs/common';
import { companyRegistryPublicCommandPublisherProvider } from './providers/company-registry-public-command-publisher.provider.js';
import { accountRegistryPublicCommandPublisherProvider } from './providers/account-registry-public-command-publisher.provider.js';
import { AwsTransportConfigProvider } from './providers/aws-transport-config.provider.js';
import { AwsSqsClientProvider } from './providers/aws-sqs-client.provider.js';
import { AwsSnsClientProvider } from './providers/aws-sns-client.provider.js';
import { onboardingManagerInternalCommandPublisherProvider } from './providers/onboarding-manager-internal-command-publisher.provider.js';
import { publisherRegistryInitializerProvider } from './providers/publisher-registry-initializer.provider.js';

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
export class MessagingAwsNestModule {}
