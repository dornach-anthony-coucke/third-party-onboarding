import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@third-party-onboarding-manager/database-nest-module';
import { CqrsModule } from '@nestjs/cqrs';
import { CommandPublisher } from './services/command-publisher.service';
import { CommandOutboxPoller } from './services/command-outbox-poller.service';
import { CommandOutboxRepository } from './repositpories/command-outbox.repository';
import { MessagingAwsNestModule } from '@third-party-onboarding-manager/messaging-aws-nest';
import { MessagingCoreModule } from '@third-party-onboarding-manager/messaging-core-nest-module';

@Module({
  imports: [
    CqrsModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    MessagingCoreModule.forRoot(),
    MessagingAwsNestModule.forRoot(),
    MessagingAwsNestModule.forFeature([
      {
        key: 'third-party-onboarding-manager',
        queueName: 'ONBOARDING_MANAGER_INTERNAL_COMMANDS_QUEUE',
        type: 'sqs',
      },
      {
        key: 'company-registry',
        queueName: 'COMPANY_REGISTRY_PUBLIC_COMMANDS_QUEUE',
        type: 'sqs',
      },
      {
        key: 'account-registry',
        queueName: 'ACCOUNT_REGISTRY_PUBLIC_COMMANDS_QUEUE',
        type: 'sqs',
      },
    ]),
  ],
  providers: [CommandPublisher, CommandOutboxPoller, CommandOutboxRepository],
})
export class AppModule {}
