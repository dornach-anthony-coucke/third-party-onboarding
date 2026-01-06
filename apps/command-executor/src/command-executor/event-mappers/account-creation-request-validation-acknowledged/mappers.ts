import type { MapperRegistryItem } from '@couckedev/mapper-registry';
import { mapEventstoreStoredEventToAccountCreationRequestValidationAcknowledgedEvent } from './from-eventstore-stored-event.mapper.js';
import { mapAccountCreationRequestValidationAcknowledgedEventToEventstoreStorableEvent } from './to-eventstore-storable-event.mapper.js';
import { mapAccountCreationRequestValidationAcknowledgedEventToOutboxStorableEvent } from './to-outbox-storable-event.mapper.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const accountCreationRequestValidationAcknowledgedMappers: MapperRegistryItem<any, any>[] = [
  mapEventstoreStoredEventToAccountCreationRequestValidationAcknowledgedEvent,
  mapAccountCreationRequestValidationAcknowledgedEventToEventstoreStorableEvent,
  mapAccountCreationRequestValidationAcknowledgedEventToOutboxStorableEvent,
];
