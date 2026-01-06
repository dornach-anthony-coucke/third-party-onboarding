import type { MapperRegistryItem } from '@couckedev/mapper-registry';
import { mapEventstoreStoredEventToCompanyCreationRequestValidationAcknowledgedEvent } from './from-eventstore-stored-event.mapper.js';
import { mapCompanyCreationRequestRejectionAcknowledgedEventToEventstoreStorableEvent } from './to-eventstore-storable-event.mapper.js';
import { mapCompanyCreationRequestRejectionAcknowledgedEventToOutboxStorableEvent } from './to-outbox-storable-event.mapper.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const companyCreationRequestRejectionAcknowledgedMappers: MapperRegistryItem<any, any>[] = [
  mapEventstoreStoredEventToCompanyCreationRequestValidationAcknowledgedEvent,
  mapCompanyCreationRequestRejectionAcknowledgedEventToEventstoreStorableEvent,
  mapCompanyCreationRequestRejectionAcknowledgedEventToOutboxStorableEvent,
];
