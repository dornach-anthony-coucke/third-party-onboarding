import { IsString } from 'class-validator';

export class AcknowledgeAccountCreationRequestValidationMessagePayloadDto {
  @IsString()
  onboardingRequestId!: string;
}
