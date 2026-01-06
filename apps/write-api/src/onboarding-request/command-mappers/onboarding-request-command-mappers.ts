import type { MapperRegistryItem } from '@couckedev/mapper-registry';
import { mapCreateOnboardingRequestCommandToOutboxStorableCommand } from './request-onboarding-command.mappers';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const onboardingRequestCommandMappers: MapperRegistryItem<any, any>[] = [
  mapCreateOnboardingRequestCommandToOutboxStorableCommand,
];
