import { Module } from '@nestjs/common';
import { companyRegistryPublicCommandPublisherProvider } from './providers/company-registry-public-command-publisher.provider.js';
import { accountRegistryPublicCommandPublisherProvider } from './providers/account-registry-public-command-publisher.provider.js';
import { AwsTransportConfigProvider } from './providers/aws-transport-config.provider.js';
import { AwsSqsClientProvider } from './providers/aws-sqs-client.provider.js';
import { AwsSnsClientProvider } from './providers/aws-sns-client.provider.js';
import { onboardingManagerInternalCommandPublisherProvider } from './providers/onboarding-manager-internal-command-publisher.provider.js';

@Module({
  providers: [
    companyRegistryPublicCommandPublisherProvider,
    accountRegistryPublicCommandPublisherProvider,
    onboardingManagerInternalCommandPublisherProvider,
    AwsTransportConfigProvider,
    AwsSqsClientProvider,
    AwsSnsClientProvider,
  ],
  exports: [
    companyRegistryPublicCommandPublisherProvider,
    accountRegistryPublicCommandPublisherProvider,
    onboardingManagerInternalCommandPublisherProvider,
    AwsSqsClientProvider,
    AwsSnsClientProvider,
    AwsTransportConfigProvider,
  ],
})
export class MessagingAwsNestModule {}
