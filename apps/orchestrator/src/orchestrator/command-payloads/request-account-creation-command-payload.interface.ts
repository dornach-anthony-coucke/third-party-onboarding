import type { RequestContextDto } from '../dtos/request-context.dto.js';

export interface RequestAccountCreationCommandPayload {
  accountTypeCode: number;
  requestContext: RequestContextDto;
}
