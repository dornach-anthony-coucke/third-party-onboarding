import type { MapperRegistryItem } from '@couckedev/mapper-registry';
import { mapEventstoreStoredEventToOnboardingRequestedEvent } from './from-eventstore-stored-event.mapper.js';
import { mapOnboardingRequestedEventToEventstoreStorableEvent } from './to-eventstore-storable-event.mapper.js';
import { mapOnboardingRequestedEventToOutboxStorableEvent } from './to-outbox-storable-event.mapper.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const onboardingRequestedMappers: MapperRegistryItem<any, any>[] = [
  mapEventstoreStoredEventToOnboardingRequestedEvent,
  mapOnboardingRequestedEventToEventstoreStorableEvent,
  mapOnboardingRequestedEventToOutboxStorableEvent,
];
