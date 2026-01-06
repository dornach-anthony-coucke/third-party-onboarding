import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@third-party-onboarding-manager/database-nest-module';
import { MapperRegistryModule } from '@third-party-onboarding-manager/mapper-registry-nest-module';
import { OrchestratorModule } from '../orchestrator/orchestrator.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    MapperRegistryModule.forRoot(),
    OrchestratorModule,
  ],
})
export class AppModule {}
