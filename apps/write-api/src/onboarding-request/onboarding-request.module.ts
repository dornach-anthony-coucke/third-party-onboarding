import { Module } from '@nestjs/common';
import { OnboardingRequestController } from './controllers/onboarding-request.controller';
import { MapperRegistryModule } from '@third-party-onboarding-manager/mapper-registry-nest-module';
import { CommandOutboxRepository } from './repositories/command-outbox.repository';
import { OnboardingRequestService } from './services/onboarding-request.service.js';
import { onboardingRequestCommandMappers } from './command-mappers/onboarding-request-command-mappers';

@Module({
  imports: [MapperRegistryModule.forFeature(onboardingRequestCommandMappers)],
  providers: [OnboardingRequestService, CommandOutboxRepository],
  controllers: [OnboardingRequestController],
})
export class OnboardingRequestModule {}
