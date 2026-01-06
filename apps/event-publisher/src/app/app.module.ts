import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { DatabaseModule } from '@third-party-onboarding-manager/database-nest-module';
import { CqrsModule } from '@nestjs/cqrs';
import { EventPublisher } from './services/event-publisher.service';
import { EventOutboxPoller } from './services/event-outbox-poller.service';
import { EventOutboxRepository } from './repositpories/event-outbox.repository';

@Module({
  imports: [
    CqrsModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    ClientsModule.register([
      {
        name: 'ONBOARDING_MANAGER_PUBLIC_EVENT_CLIENT',
        transport: Transport.RMQ,
        options: {
          urls: [
            `amqp://${process.env.MESSAGE_BUS_USERNAME}:${process.env.MESSAGE_BUS_PASSWORD}@${process.env.MESSAGE_BUS_HOST ?? 'third-party-onboarding-manager-message-bus'}:${process.env.MESSAGE_BUS_PORT}`,
          ],
          exchange: process.env.ONBOARDING_MANAGER_PUBLIC_EVENT_EXCHANGE,
          exchangeType: 'topic',
          wildcards: true,
          persistent: true,
          queueOptions: { durable: true },
        },
      },
    ]),
  ],
  providers: [EventPublisher, EventOutboxPoller, EventOutboxRepository],
})
export class AppModule {}