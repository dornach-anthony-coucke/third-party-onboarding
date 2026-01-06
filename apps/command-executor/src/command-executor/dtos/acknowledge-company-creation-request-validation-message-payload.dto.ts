import { IsString } from 'class-validator';

export class AcknowledgeCompanyCreationRequestValidationMessagePayloadDto {
  @IsString()
  onboardingRequestId!: string;
}
