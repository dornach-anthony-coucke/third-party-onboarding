import { Type } from 'class-transformer';
import { IsDate, IsString } from 'class-validator';

export class EventPayloadDto {
  @IsDate()
  @Type(() => Date)
  occuredAt!: Date;

  @IsString()
  @Type(() => String)
  eventType!: string;
}
