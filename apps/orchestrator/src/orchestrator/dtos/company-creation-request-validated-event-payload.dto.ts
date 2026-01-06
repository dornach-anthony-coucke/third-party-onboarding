import { Type } from 'class-transformer';
import { RequestContextDto } from './request-context.dto';
import { ValidateNested } from 'class-validator';
import { EventPayloadDto } from './event-payload.dto.js';

export class CompanyCreationRequestValidatedEventPayloadDto extends EventPayloadDto {
  @Type(() => RequestContextDto)
  @ValidateNested()
  requestContext!: RequestContextDto;
}
