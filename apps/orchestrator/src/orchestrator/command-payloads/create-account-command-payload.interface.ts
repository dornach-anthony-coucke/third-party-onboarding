import type { RequestContextDto } from '../dtos/request-context.dto.js';

export interface CreateAccountCommandPayload {
  requestContext: RequestContextDto;
}
