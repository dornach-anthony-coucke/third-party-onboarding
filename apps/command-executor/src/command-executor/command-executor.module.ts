import { Module } from '@nestjs/common';
import { OnboardingRepositoryAdapter } from './repositories/onboarding-repository.adapter';
import { MapperRegistryModule } from '@third-party-onboarding-manager/mapper-registry-nest-module';
import { CreateOnboardingRequestSubscriber } from './command-subscribers/create-onboarding-request.subscriber';
import event_mappers from './event-mappers';
import { CreateOnboardingRequestHandler } from '@dornach/third-party-onboarding-manager-application';
import { CREATE_ONBOARDING_REQUEST_HANDLER } from './tokens/create-onboarding-request-handler.token';
import { MessagingAwsNestModule } from '@third-party-onboarding-manager/messaging-aws-nest';
import { OnboardingManagerInternalCommandConsumer } from './consumers/onboarding-manager-internal-command.consumer';
import { ONBOARDING_MANAGER_INTERNAL_COMMAND_CONSUMER_RUNNER } from './tokens/onboarding-manager-internal-command-consumer-runner.token';
import {
  ConsumerRunner,
  MessagingCoreModule,
  MESSAGE_LISTENERS,
} from '@third-party-onboarding-manager/messaging-core-nest-module';

@Module({
  imports: [
    MapperRegistryModule.forFeature(event_mappers),
    MessagingAwsNestModule.forRoot(),
    MessagingCoreModule.forRoot(),
  ],
  providers: [
    OnboardingRepositoryAdapter,
    {
      provide: CREATE_ONBOARDING_REQUEST_HANDLER,
      useFactory: (onboardingRepository: OnboardingRepositoryAdapter) =>
        new CreateOnboardingRequestHandler(onboardingRepository),
      inject: [OnboardingRepositoryAdapter],
    },

    { provide: MESSAGE_LISTENERS, useExisting: CreateOnboardingRequestSubscriber },
    CreateOnboardingRequestSubscriber,
    OnboardingManagerInternalCommandConsumer,
    {
      provide: ONBOARDING_MANAGER_INTERNAL_COMMAND_CONSUMER_RUNNER,
      useFactory: (consumer: OnboardingManagerInternalCommandConsumer) =>
        new ConsumerRunner(consumer, 10000),
      inject: [OnboardingManagerInternalCommandConsumer],
    },
  ],
})
export class CommandExecutorModule {}
