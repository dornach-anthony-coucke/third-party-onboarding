import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@third-party-onboarding-manager/database-nest-module';
import { CqrsModule } from '@nestjs/cqrs';
import { CommandPublisher } from './services/command-publisher.service';
import { CommandOutboxPoller } from './services/command-outbox-poller.service';
import { CommandOutboxRepository } from './repositpories/command-outbox.repository';
import { MessagingAwsNestModule } from '@third-party-onboarding-manager/messaging-aws-nest';

@Module({
  imports: [
    CqrsModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    MessagingAwsNestModule,
  ],
  providers: [CommandPublisher, CommandOutboxPoller, CommandOutboxRepository],
})
export class AppModule {}
