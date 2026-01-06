import type { MapperRegistryItem } from '@couckedev/mapper-registry';
import { mapEventstoreStoredEventToCompanyCreationRequestValidationAcknowledgedEvent } from './from-eventstore-stored-event.mapper.js';
import { mapCompanyCreationRequestValidationAcknowledgedEventToEventstoreStorableEvent } from './to-eventstore-storable-event.mapper.js';
import { mapCompanyCreationRequestValidationAcknowledgedEventToOutboxStorableEvent } from './to-outbox-storable-event.mapper.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const companyCreationRequestValidationAcknowledgedMappers: MapperRegistryItem<any, any>[] = [
  mapEventstoreStoredEventToCompanyCreationRequestValidationAcknowledgedEvent,
  mapCompanyCreationRequestValidationAcknowledgedEventToEventstoreStorableEvent,
  mapCompanyCreationRequestValidationAcknowledgedEventToOutboxStorableEvent,
];
