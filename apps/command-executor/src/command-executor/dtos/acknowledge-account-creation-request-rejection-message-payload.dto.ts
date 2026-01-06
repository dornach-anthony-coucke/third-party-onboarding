import { IsArray, IsString } from 'class-validator';

export class AcknowledgeAccountCreationRequestRejectionMessagePayloadDto {
  @IsString()
  onboardingRequestId!: string;

  @IsString({ each: true })
  @IsArray()
  errors!: string[];
}
