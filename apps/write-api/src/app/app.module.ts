import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@third-party-onboarding-manager/database-nest-module';
import { HealthController } from './health.controller';
import { MapperRegistryModule } from '@third-party-onboarding-manager/mapper-registry-nest-module';
import { OnboardingRequestModule } from '../onboarding-request/onboarding-request.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    MapperRegistryModule.forRoot(),
    OnboardingRequestModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
