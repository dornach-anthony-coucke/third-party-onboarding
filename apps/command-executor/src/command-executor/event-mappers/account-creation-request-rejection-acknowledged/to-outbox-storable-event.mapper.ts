import { createMapper } from '@couckedev/mapper-registry';
import type { types as databaseTypes } from '@third-party-onboarding-manager/drizzle-core';
import type { AccountCreationRequestRejectionAcknowledgedEvent } from '@dornach/third-party-onboarding-manager-domain';
import type { AccountCreationRequestRejectionAcknowledgedEventPayload } from '../../event-payloads/account-creation-request-rejection-acknowledged-event.payload.js';

export const mapAccountCreationRequestRejectionAcknowledgedEventToOutboxStorableEvent =
  createMapper(
    'AccountCreationRequestRejectionAcknowledgedEvent',
    'OutboxStorableEvent',
    (
      accountCreationRequestRejectionAcknowledgedEvent: AccountCreationRequestRejectionAcknowledgedEvent,
    ): databaseTypes.OutboxStorableEvent<AccountCreationRequestRejectionAcknowledgedEventPayload> => {
      return {
        type: 'AccountCreationRequestRejectionAcknowledgedEvent',
        aggregateId: BigInt(accountCreationRequestRejectionAcknowledgedEvent.onboardingRequestId),
        routingKey: 'onboarding.account_creation_request_rejection_acknowledged',
        payload: {
          onboardingRequestId: accountCreationRequestRejectionAcknowledgedEvent.onboardingRequestId,
          errors: accountCreationRequestRejectionAcknowledgedEvent.errors,
        },
      };
    },
  );
