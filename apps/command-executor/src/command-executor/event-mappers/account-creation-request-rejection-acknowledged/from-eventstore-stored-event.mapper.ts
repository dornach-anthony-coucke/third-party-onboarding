import { createMapper } from '@couckedev/mapper-registry';
import type { types as databaseTypes } from '@third-party-onboarding-manager/drizzle-core';
import { AccountCreationRequestRejectionAcknowledgedEvent } from '@dornach/third-party-onboarding-manager-domain';
import type { AccountCreationRequestRejectionAcknowledgedEventPayload } from '../../event-payloads/account-creation-request-rejection-acknowledged-event.payload.js';

export const mapEventstoreStoredEventToAccountCreationRequestRejectionAcknowledgedEvent =
  createMapper(
    'EventstoreStoredEvent',
    'AccountCreationRequestRejectionAcknowledgedEvent',
    (
      storedEvent: databaseTypes.EventstoreStoredEvent<AccountCreationRequestRejectionAcknowledgedEventPayload>,
    ): AccountCreationRequestRejectionAcknowledgedEvent => {
      return new AccountCreationRequestRejectionAcknowledgedEvent(
        storedEvent.payload.onboardingRequestId,
        storedEvent.payload.errors,
      );
    },
  );
