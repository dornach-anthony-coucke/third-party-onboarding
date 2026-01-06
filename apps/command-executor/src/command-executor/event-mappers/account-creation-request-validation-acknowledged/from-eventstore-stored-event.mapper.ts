import { createMapper } from '@couckedev/mapper-registry';
import type { types as databaseTypes } from '@third-party-onboarding-manager/drizzle-core';
import { AccountCreationRequestValidationAcknowledgedEvent } from '@dornach/third-party-onboarding-manager-domain';
import type { AccountCreationRequestValidationAcknowledgedEventPayload } from '../../event-payloads/account-creation-request-validation-acknowledged-event.payload.js';

export const mapEventstoreStoredEventToAccountCreationRequestValidationAcknowledgedEvent =
  createMapper(
    'EventstoreStoredEvent',
    'AccountCreationRequestValidationAcknowledgedEvent',
    (
      storedEvent: databaseTypes.EventstoreStoredEvent<AccountCreationRequestValidationAcknowledgedEventPayload>,
    ): AccountCreationRequestValidationAcknowledgedEvent => {
      return new AccountCreationRequestValidationAcknowledgedEvent(
        storedEvent.payload.onboardingRequestId,
      );
    },
  );
