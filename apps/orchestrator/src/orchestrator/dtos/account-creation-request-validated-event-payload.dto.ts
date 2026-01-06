import { Type } from 'class-transformer';
import { RequestContextDto } from './request-context.dto';
import { ValidateNested } from 'class-validator';
import { EventPayloadDto } from './event-payload.dto.js';

export class AccountCreationRequestValidatedEventPayloadDto extends EventPayloadDto {
  @Type(() => RequestContextDto)
  @ValidateNested()
  requestContext!: RequestContextDto;
}
