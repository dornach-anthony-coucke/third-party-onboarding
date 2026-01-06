import type { RequestContextDto } from '../dtos/request-context.dto.js';

export interface CreateCompanyCommandPayload {
  requestContext: RequestContextDto;
}
