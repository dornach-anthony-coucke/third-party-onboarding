import { createMapper } from '@couckedev/mapper-registry';
import type { types as databaseTypes } from '@third-party-onboarding-manager/drizzle-core';
import type { AccountCreationRequestValidationAcknowledgedEvent } from '@dornach/third-party-onboarding-manager-domain';
import type { AccountCreationRequestValidationAcknowledgedEventPayload } from '../../event-payloads/account-creation-request-validation-acknowledged-event.payload.js';

export const mapAccountCreationRequestValidationAcknowledgedEventToEventstoreStorableEvent =
  createMapper(
    'AccountCreationRequestValidationAcknowledgedEvent',
    'EventstoreStorableEvent',
    (
      accountCreationRequestValidationAcknowledgedEvent: AccountCreationRequestValidationAcknowledgedEvent,
    ): databaseTypes.EventstoreStorableEvent<AccountCreationRequestValidationAcknowledgedEventPayload> => {
      return {
        type: 'AccountCreationRequestValidationAcknowledgedEvent',
        aggregateId: BigInt(accountCreationRequestValidationAcknowledgedEvent.onboardingRequestId),
        payload: {
          onboardingRequestId:
            accountCreationRequestValidationAcknowledgedEvent.onboardingRequestId,
        },
      };
    },
  );
