import { ConfigService } from '@nestjs/config';
import {
  ONBOARDING_MANAGER_INTERNAL_COMMANDS_QUEUE_NAME,
  COMPANY_REGISTRY_PUBLIC_COMMANDS_QUEUE_NAME,
  ACCOUNT_REGISTRY_PUBLIC_COMMANDS_QUEUE_NAME,
} from '../tokens/queue-names.token.js';

export const onboardingManagerInternalCommandsQueueNameProvider = {
  provide: ONBOARDING_MANAGER_INTERNAL_COMMANDS_QUEUE_NAME,
  useFactory: (configService: ConfigService) => {
    return configService.getOrThrow<string>('ONBOARDING_MANAGER_INTERNAL_COMMANDS_QUEUE');
  },
  inject: [ConfigService],
};

export const companyRegistryPublicCommandsQueueNameProvider = {
  provide: COMPANY_REGISTRY_PUBLIC_COMMANDS_QUEUE_NAME,
  useFactory: (configService: ConfigService) => {
    return configService.getOrThrow<string>('COMPANY_REGISTRY_PUBLIC_COMMANDS_QUEUE');
  },
  inject: [ConfigService],
};

export const accountRegistryPublicCommandsQueueNameProvider = {
  provide: ACCOUNT_REGISTRY_PUBLIC_COMMANDS_QUEUE_NAME,
  useFactory: (configService: ConfigService) => {
    return configService.getOrThrow<string>('ACCOUNT_REGISTRY_PUBLIC_COMMANDS_QUEUE');
  },
  inject: [ConfigService],
};
