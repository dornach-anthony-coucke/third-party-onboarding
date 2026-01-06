import type { CompanyRegistryPublicCommand } from '@dornach/company-registry-contracts';
import type { ThirdPartyAccountRegistryPublicCommand } from '@dornach/third-party-account-registry-contracts';
import type { OnboardingManagerCommand } from '@dornach/third-party-onboarding-manager-application';

export type ProcessableCommand =
  | CompanyRegistryPublicCommand
  | ThirdPartyAccountRegistryPublicCommand
  | OnboardingManagerCommand;
