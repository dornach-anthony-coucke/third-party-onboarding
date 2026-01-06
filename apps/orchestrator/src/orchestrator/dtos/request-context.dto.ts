import { IsString } from 'class-validator';

export class RequestContextDto {
  @IsString()
  requestId!: string;

  @IsString()
  requestType!: string;
}
