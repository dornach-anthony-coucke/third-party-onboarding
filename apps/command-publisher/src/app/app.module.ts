import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
    MessagingAwsNestModule.registerPublishersAsync({
      useFactory: (configService: ConfigService) => [
        // AWS publisher registration
        {
          key: 'third-party-onboarding-manager',
          destination: configService.getOrThrow('ONBOARDING_MANAGER_INTERNAL_COMMANDS_QUEUE'),
          metadata: { transportType: 'sqs' },
        },
        {
          key: 'company-registry',
          destination: configService.getOrThrow('COMPANY_REGISTRY_PUBLIC_COMMANDS_QUEUE'),
          metadata: { transportType: 'sqs' },
        },
        {
          key: 'account-registry',
          destination: configService.getOrThrow('ACCOUNT_REGISTRY_PUBLIC_COMMANDS_QUEUE'),
          metadata: { transportType: 'sqs' },
        },
      ],
      inject: [ConfigService],
    }),
  ],
  providers: [CommandPublisher, CommandOutboxPoller, CommandOutboxRepository],
})
export class AppModule {}
