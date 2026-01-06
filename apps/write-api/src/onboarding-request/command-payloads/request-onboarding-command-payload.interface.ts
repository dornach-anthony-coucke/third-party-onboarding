export interface RequestOnboardingCommandPayload {
  company: {
    legalIdentity: {
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
      zipcode?: string;
    };
  };
  account: {
    accountTypeCode: number;
  };
}
