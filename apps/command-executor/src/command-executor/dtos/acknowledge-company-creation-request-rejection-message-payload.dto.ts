import { IsArray, IsString } from 'class-validator';

export class AcknowledgeCompanyCreationRequestRejectionMessagePayloadDto {
  @IsString()
  onboardingRequestId!: string;

  @IsString({ each: true })
  @IsArray()
  errors!: string[];
}
