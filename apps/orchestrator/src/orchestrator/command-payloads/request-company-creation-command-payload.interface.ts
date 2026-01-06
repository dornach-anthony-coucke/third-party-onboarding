import type { RequestContextDto } from '../dtos/request-context.dto.js';

export interface RequestCompanyCreationCommandPayload {
  companyLegalIdentity: {
    legalName: string;
    legalId?: string;
    legalForm?: string;
  };
  headquarterAddress: {
    line1: string;
    country: string;
    city: string;
    line2?: string;
    line3?: string;
    zipCode?: string;
  };
  requestContext: RequestContextDto;
}
