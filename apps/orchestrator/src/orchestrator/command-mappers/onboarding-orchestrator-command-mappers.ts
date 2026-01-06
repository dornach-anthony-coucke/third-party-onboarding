import type { MapperRegistryItem } from '@couckedev/mapper-registry';
import { mapRequestCompanyCreationCommandToOutboxStorableCommand } from './request-company-creation-command.mapper';
import { mapRequestAccountCreationCommandToOutboxStorableCommand } from './request-account-creation-command.mapper';
import { mapAcknowledgeCompanyCreationRequestValidationCommandToOutboxStorableCommand } from './acknowledge-company-creation-request-validation-command.mapper';
import { mapAcknowledgeAccountCreationRequestValidationCommandToOutboxStorableCommand } from './acknowledge-account-creation-request-validation-command.mapper';
import { mapAcknowledgeCompanyCreationRequestRejectionCommandToOutboxStorableCommand } from './acknowledge-company-creation-request-rejection-command.mapper';
import { mapAcknowledgeAccountCreationRequestRejectionCommandToOutboxStorableCommand } from './acknowledge-account-creation-request-rejection-command.mapper';
import { mapCreateCompanyCommandToOutboxStorableCommand } from './create-company-command.mapper';
import { mapCreateAccountCommandToOutboxStorableCommand } from './create-account-command.mapper';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const orchestratorCommandMappers: MapperRegistryItem<any, any>[] = [
  mapRequestCompanyCreationCommandToOutboxStorableCommand,
  mapRequestAccountCreationCommandToOutboxStorableCommand,
  mapAcknowledgeCompanyCreationRequestValidationCommandToOutboxStorableCommand,
  mapAcknowledgeAccountCreationRequestValidationCommandToOutboxStorableCommand,
  mapAcknowledgeCompanyCreationRequestRejectionCommandToOutboxStorableCommand,
  mapAcknowledgeAccountCreationRequestRejectionCommandToOutboxStorableCommand,
  mapCreateCompanyCommandToOutboxStorableCommand,
  mapCreateAccountCommandToOutboxStorableCommand,
];
