import type { types as databaseTypes } from '@third-party-onboarding-manager/drizzle-core';
import { createMapper } from '@couckedev/mapper-registry';
import type { RequestOnboardingCommandPayload } from '../command-payloads/request-onboarding-command-payload.interface';
import type { CreateOnboardingRequestCommand } from '@dornach/third-party-onboarding-manager-application';

export const mapCreateOnboardingRequestCommandToOutboxStorableCommand = createMapper(
  'CreateOnboardingRequestCommand',
  'OutboxStorableCommand',
  (
    createOnboardingRequestCommand: CreateOnboardingRequestCommand,
  ): databaseTypes.OutboxStorableCommand<RequestOnboardingCommandPayload> => {
    return {
      destinationBoundedContext: 'third-party-onboarding-manager',
      routingKey: 'onboarding.create-request',
      payload: createOnboardingRequestCommand,
      type: 'CreateOnboardingRequestCommand',
      createdAt: createOnboardingRequestCommand.createdAt,
    };
  },
);
