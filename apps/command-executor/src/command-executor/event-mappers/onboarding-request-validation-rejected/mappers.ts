import type { MapperRegistryItem } from '@couckedev/mapper-registry';
import { mapEventstoreStoredEventToOnboardingRequestValidationRejectedEvent } from './from-eventstore-stored-event.mapper.js';
import { mapOnboardingRequestValidationRejectedEventToEventstoreStorableEvent } from './to-eventstore-storable-event.mapper.js';
import { mapOnboardingRequestValidationRejectedEventToOutboxStorableEvent } from './to-outbox-storable-event.mapper.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const onboardingRequestValidationRejectedMappers: MapperRegistryItem<any, any>[] = [
  mapEventstoreStoredEventToOnboardingRequestValidationRejectedEvent,
  mapOnboardingRequestValidationRejectedEventToEventstoreStorableEvent,
  mapOnboardingRequestValidationRejectedEventToOutboxStorableEvent,
];
