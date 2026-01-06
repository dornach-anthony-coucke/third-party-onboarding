export interface OnboardingRequestedEventPayload {
  onboardingRequestId: string;
  company: {
    companyLegalIdentity: {
      legalName: string;
      legalId?: string;
      legalForm?: string;
    };
    headquarterAddress: {
      line1: string;
      city: string;
      country: string;
      line2?: string;
      line3?: string;
      zipCode?: string;
    };
  };
  account: {
    accountTypeCode: number;
  };
}
