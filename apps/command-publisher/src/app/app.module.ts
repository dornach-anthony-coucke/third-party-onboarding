import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@third-party-onboarding-manager/database-nest-module';
import { CqrsModule } from '@nestjs/cqrs';
import { CommandPublisher } from './services/command-publisher.service';
import { CommandOutboxPoller } from './services/command-outbox-poller.service';
import { CommandOutboxRepository } from './repositpories/command-outbox.repository';
import { MessagingAwsNestModule } from '@third-party-onboarding-manager/messaging-aws-nest';
import { MessagingCoreModule } from '@third-party-onboarding-manager/messaging-core-nest';

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
        destination: 'ONBOARDING_MANAGER_INTERNAL_COMMANDS_QUEUE',
        metadata: { transportType: 'sqs' },
      },
      {
        key: 'company-registry',
        destination: 'COMPANY_REGISTRY_PUBLIC_COMMANDS_QUEUE',
        metadata: { transportType: 'sqs' },
      },
      {
        key: 'account-registry',
        destination: 'ACCOUNT_REGISTRY_PUBLIC_COMMANDS_QUEUE',
        metadata: { transportType: 'sqs' },
      },
    ]),
  ],
  providers: [CommandPublisher, CommandOutboxPoller, CommandOutboxRepository],
})
export class AppModule {}
