import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@third-party-onboarding-manager/database-nest-module';
import { MapperRegistryModule } from '@third-party-onboarding-manager/mapper-registry-nest-module';
import { CommandExecutorModule } from '../command-executor/command-executor.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    MapperRegistryModule.forRoot(),
    CommandExecutorModule,
  ],
})
export class AppModule {}
