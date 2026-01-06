import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Transport, type MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: [
        `amqp://${process.env.MESSAGE_BUS_USERNAME}:${process.env.MESSAGE_BUS_PASSWORD}@${process.env.MESSAGE_BUS_HOST}:${process.env.MESSAGE_BUS_PORT}`,
      ],
      queue: process.env.ONBOARDING_MANAGER_ORCHESTRATOR_QUEUE,
    },
  });

  await app.listen();
}

void bootstrap();
