import { Module } from '@nestjs/common';
import { CommandOutboxRepository } from './repositories/command-outbox.repository.js';
import { OnboardingRequestedEventHandler } from './event-handler/onboarding-requested.handler.js';
import { CompanyRegistryCommandBusAdapter } from './command-bus/company-registry-command-bus.adapter.js';
import { AccountRegistryCommandBusAdapter } from './command-bus/account-registry-command-bus.adapter.js';
import { OnboardingManagerCommandBusAdapter } from './command-bus/onboarding-manager-command-bus.adapter.js';
import { MapperRegistryModule } from '@third-party-onboarding-manager/mapper-registry-nest-module';
import { orchestratorCommandMappers } from './command-mappers/onboarding-orchestrator-command-mappers.js';
import { PROCESS_MANAGER_TOKEN } from './tokens/process-manager.token.js';
import { OnboardingProcessManager } from '@dornach/third-party-onboarding-manager-application';
import { AccountCreationRequestRejectedEventHandler } from './event-handler/account-creation-request-rejected.handler.js';
import { CompanyCreationRequestRejectedEventHandler } from './event-handler/company-creation-request-rejected.handler.js';
import { AccountCreationRequestValidatedEventHandler } from './event-handler/account-creation-request-validated.handler.js';
import { CompanyCreationRequestValidatedEventHandler } from './event-handler/company-creation-request-validated.handler.js';

@Module({
  imports: [MapperRegistryModule.forFeature(orchestratorCommandMappers)],
  providers: [
    CommandOutboxRepository,
    {
      provide: PROCESS_MANAGER_TOKEN,
      useFactory: (
        companyRegistryCommandBus: CompanyRegistryCommandBusAdapter,
        accountRegistryCommandBus: AccountRegistryCommandBusAdapter,
        onboardingManagerCommandBus: OnboardingManagerCommandBusAdapter,
      ) =>
        new OnboardingProcessManager(
          onboardingManagerCommandBus,
          companyRegistryCommandBus,
          accountRegistryCommandBus,
        ),
      inject: [
        CompanyRegistryCommandBusAdapter,
        AccountRegistryCommandBusAdapter,
        OnboardingManagerCommandBusAdapter,
      ],
    },
    CompanyRegistryCommandBusAdapter,
    AccountRegistryCommandBusAdapter,
    OnboardingManagerCommandBusAdapter,
  ],
  controllers: [
    OnboardingRequestedEventHandler,
    AccountCreationRequestRejectedEventHandler,
    CompanyCreationRequestRejectedEventHandler,
    AccountCreationRequestValidatedEventHandler,
    CompanyCreationRequestValidatedEventHandler,
  ],
})
export class OrchestratorModule {}
