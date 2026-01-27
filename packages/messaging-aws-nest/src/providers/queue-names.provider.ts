import { ConfigService } from '@nestjs/config';
import {
  ONBOARDING_MANAGER_INTERNAL_COMMANDS_QUEUE_NAME,
  COMPANY_REGISTRY_PUBLIC_COMMANDS_QUEUE_NAME,
  ACCOUNT_REGISTRY_PUBLIC_COMMANDS_QUEUE_NAME,
} from '../tokens/queue-names.token.js';
import { QUEUE_NAMES_MAP } from '../tokens/queue-names-map.token.js';

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

/**
 * Provides a Map of all queue name tokens to their resolved values.
 * This makes it easy to look up queue names by their token constants.
 */
export const queueNamesMapProvider = {
  provide: QUEUE_NAMES_MAP,
  useFactory: (
    onboardingManagerQueue: string,
    companyRegistryQueue: string,
    accountRegistryQueue: string,
  ) => {
    const map = new Map<string, string>();
    map.set(ONBOARDING_MANAGER_INTERNAL_COMMANDS_QUEUE_NAME, onboardingManagerQueue);
    map.set(COMPANY_REGISTRY_PUBLIC_COMMANDS_QUEUE_NAME, companyRegistryQueue);
    map.set(ACCOUNT_REGISTRY_PUBLIC_COMMANDS_QUEUE_NAME, accountRegistryQueue);
    return map;
  },
  inject: [
    ONBOARDING_MANAGER_INTERNAL_COMMANDS_QUEUE_NAME,
    COMPANY_REGISTRY_PUBLIC_COMMANDS_QUEUE_NAME,
    ACCOUNT_REGISTRY_PUBLIC_COMMANDS_QUEUE_NAME,
  ],
};
