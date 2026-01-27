import { DynamicModule, Module, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AwsTransportConfigProvider } from './providers/aws-transport-config.provider.js';
import { AwsSqsClientProvider } from './providers/aws-sqs-client.provider.js';
import { AwsSnsClientProvider } from './providers/aws-sns-client.provider.js';
import { PublisherRegistryInitializer } from './services/publisher-registry-initializer.service.js';
import { PUBLISHER_CONFIGS } from './tokens/publisher-configs.token.js';
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

  static registerPublishersAsync(options: {
    useFactory: (...args: any[]) => PublisherConfig[] | Promise<PublisherConfig[]>;
    inject?: any[];
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
