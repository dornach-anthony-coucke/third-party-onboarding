import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  await NestFactory.createApplicationContext(AppModule);
  console.log(`Command publisher started`);
}

void bootstrap();
