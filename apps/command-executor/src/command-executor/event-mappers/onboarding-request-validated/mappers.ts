import type { MapperRegistryItem } from '@couckedev/mapper-registry';
import { mapEventstoreStoredEventToAccountCreationRequestRejectionAcknowledgedEvent } from './from-eventstore-stored-event.mapper.js';
import { mapAccountCreationRequestRejectionAcknowledgedEventToEventstoreStorableEvent } from './to-eventstore-storable-event.mapper.js';
import { mapAccountCreationRequestRejectionAcknowledgedEventToOutboxStorableEvent } from './to-outbox-storable-event.mapper.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const accountCreationRequestRejectionAcknowledgedMappers: MapperRegistryItem<any, any>[] = [
  mapEventstoreStoredEventToAccountCreationRequestRejectionAcknowledgedEvent,
  mapAccountCreationRequestRejectionAcknowledgedEventToEventstoreStorableEvent,
  mapAccountCreationRequestRejectionAcknowledgedEventToOutboxStorableEvent,
];
