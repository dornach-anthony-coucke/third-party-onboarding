import { accountCreationRequestRejectionAcknowledgedMappers } from './account-creation-request-rejection-acknowledged/mappers.js';
import { accountCreationRequestValidationAcknowledgedMappers } from './account-creation-request-validation-acknowledged/mappers.js';
import { companyCreationRequestRejectionAcknowledgedMappers } from './company-creation-request-rejection-acknowledged/mappers.js';
import { companyCreationRequestValidationAcknowledgedMappers } from './company-creation-request-validation-acknowledged/mappers.js';
import { onboardingRequestValidationRejectedMappers } from './onboarding-request-validation-rejected/mappers.js';
import { onboardingRequestedMappers } from './onboarding-requested/mappers.js';

export default [
  ...accountCreationRequestRejectionAcknowledgedMappers,
  ...accountCreationRequestValidationAcknowledgedMappers,
  ...companyCreationRequestRejectionAcknowledgedMappers,
  ...companyCreationRequestValidationAcknowledgedMappers,
  ...onboardingRequestedMappers,
  ...onboardingRequestValidationRejectedMappers,
];
