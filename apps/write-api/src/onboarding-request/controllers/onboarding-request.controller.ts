import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  InternalServerErrorException,
  Post,
} from '@nestjs/common';
import { CreateThirdPartyRequestDto } from '../requests/create-third-party-request.dto.js';
import { CreateOnboardingRequestCommand } from '@dornach/third-party-onboarding-manager-application';
import { OnboardingManagerError } from '@dornach/third-party-onboarding-manager-domain';
import { ApiTags } from '@nestjs/swagger';
import { OnboardingRequestService } from '../services/onboarding-request.service.js';

@ApiTags('onboarding-request')
@Controller('onboarding-request')
export class OnboardingRequestController {
  constructor(private readonly onboardingRequestService: OnboardingRequestService) {}

  @Post()
  @HttpCode(202)
  async requestThirdPartyCreation(@Body() createThirdPartyRequest: CreateThirdPartyRequestDto) {
    try {
      const companyRegistrationDataFromRequest = createThirdPartyRequest.company;
      const accountRegistrationDataFromRequest = createThirdPartyRequest.account;
      const createOnboardingRequestCommand = new CreateOnboardingRequestCommand(
        companyRegistrationDataFromRequest,
        accountRegistrationDataFromRequest,
      );
      await this.onboardingRequestService.createOnboardingRequest(createOnboardingRequestCommand);
    } catch (error: unknown) {
      if (error instanceof OnboardingManagerError) {
        console.log(error)
        throw new HttpException(error.message, 422);
      }
      if (error instanceof Error) {
        console.log(error)
        throw new InternalServerErrorException(error.message);
      }
    }
  }
}
