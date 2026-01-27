import { DynamicModule, Module, Provider } from '@nestjs/common';
import { AwsTransportConfigProvider } from './providers/aws-transport-config.provider.js';
import { AwsSqsClientProvider } from './providers/aws-sqs-client.provider.js';
import { AwsSnsClientProvider } from './providers/aws-sns-client.provider.js';
import { createPublisherProvider } from './providers/create-publisher.provider.js';
import type { PublisherConfig } from './types/publisher-config.interface.js';

@Module({})
export class MessagingAwsNestModule {
  static forRoot(): DynamicModule {
    return {
      module: MessagingAwsNestModule,
      providers: [AwsTransportConfigProvider, AwsSqsClientProvider, AwsSnsClientProvider],
      exports: [AwsTransportConfigProvider, AwsSqsClientProvider, AwsSnsClientProvider],
      global: true,
    };
  }

  static registerPublishers(publisherConfigurations: PublisherConfig[]): DynamicModule {
    const providers: Provider[] = publisherConfigurations.map((config) =>
      createPublisherProvider(config),
    );

    return {
      module: MessagingAwsNestModule,
      providers,
    };
  }
}
