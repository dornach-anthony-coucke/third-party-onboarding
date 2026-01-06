import { createMapper } from '@couckedev/mapper-registry';
import type { types as databaseTypes } from '@third-party-onboarding-manager/drizzle-core';
import type { AccountCreationRequestRejectionAcknowledgedEvent } from '@dornach/third-party-onboarding-manager-domain';
import type { AccountCreationRequestRejectionAcknowledgedEventPayload } from '../../event-payloads/account-creation-request-rejection-acknowledged-event.payload.js';

export const mapAccountCreationRequestRejectionAcknowledgedEventToEventstoreStorableEvent =
  createMapper(
    'AccountCreationRequestRejectionAcknowledgedEvent',
    'EventstoreStorableEvent',
    (
      accountCreationRequestRejectionAcknowledgedEvent: AccountCreationRequestRejectionAcknowledgedEvent,
    ): databaseTypes.EventstoreStorableEvent<AccountCreationRequestRejectionAcknowledgedEventPayload> => {
      return {
        type: 'AccountCreationRequestRejectionAcknowledgedEvent',
        aggregateId: BigInt(accountCreationRequestRejectionAcknowledgedEvent.onboardingRequestId),
        payload: {
          onboardingRequestId: accountCreationRequestRejectionAcknowledgedEvent.onboardingRequestId,
          errors: accountCreationRequestRejectionAcknowledgedEvent.errors,
        },
      };
    },
  );
