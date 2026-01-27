import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseModule } from '@third-party-onboarding-manager/database-nest-module';
import { CqrsModule } from '@nestjs/cqrs';
import { CommandPublisher } from './services/command-publisher.service';
import { CommandOutboxPoller } from './services/command-outbox-poller.service';
import { CommandOutboxRepository } from './repositpories/command-outbox.repository';
import { MessagingAwsNestModule } from '@third-party-onboarding-manager/messaging-aws-nest';
import { MessagingCoreModule } from '@third-party-onboarding-manager/messaging-core-nest';

// Token for queue configuration
export const QUEUES_CONFIGURATION = 'QUEUES_CONFIGURATION';

// Provider that retrieves queue names from ConfigService
const queuesConfigurationProvider = {
  provide: QUEUES_CONFIGURATION,
  useFactory: (configService: ConfigService) => ({
    'third-party-onboarding-manager': configService.getOrThrow<string>(
      'ONBOARDING_MANAGER_INTERNAL_COMMANDS_QUEUE',
    ),
    'company-registry': configService.getOrThrow<string>('COMPANY_REGISTRY_PUBLIC_COMMANDS_QUEUE'),
    'account-registry': configService.getOrThrow<string>('ACCOUNT_REGISTRY_PUBLIC_COMMANDS_QUEUE'),
  }),
  inject: [ConfigService],
};

@Module({
  imports: [
    CqrsModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    MessagingCoreModule.forRoot(),
    MessagingAwsNestModule.forRoot(), // AWS infrastructure
    MessagingAwsNestModule.registerPublishers([
      // AWS publisher registration
      {
        key: 'third-party-onboarding-manager',
        destination: QUEUES_CONFIGURATION,
        metadata: { transportType: 'sqs' },
      },
      {
        key: 'company-registry',
        destination: QUEUES_CONFIGURATION,
        metadata: { transportType: 'sqs' },
      },
      {
        key: 'account-registry',
        destination: QUEUES_CONFIGURATION,
        metadata: { transportType: 'sqs' },
      },
    ]),
  ],
  providers: [
    CommandPublisher,
    CommandOutboxPoller,
    CommandOutboxRepository,
    queuesConfigurationProvider,
  ],
})
export class AppModule {}
