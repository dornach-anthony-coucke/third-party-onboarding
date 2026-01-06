import { Type } from 'class-transformer';
import { RequestContextDto } from './request-context.dto';
import { IsArray, IsString, ValidateNested } from 'class-validator';
import { EventPayloadDto } from './event-payload.dto.js';

export class CompanyCreationRequestRejectedEventPayloadDto extends EventPayloadDto {
  @Type(() => RequestContextDto)
  @ValidateNested()
  requestContext!: RequestContextDto;

  @IsArray()
  @IsString({ each: true })
  errors!: string[];
}
