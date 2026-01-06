import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { EventPayloadDto } from './event-payload.dto.js';

class LegalIdentityDto {
  @IsString()
  @Type(() => String)
  legalName!: string;

  @IsString()
  @IsOptional()
  @Type(() => String)
  legalId?: string | undefined;

  @IsString()
  @IsOptional()
  @Type(() => String)
  legalForm?: string | undefined;
}

class HeadquarterAddressDto {
  @IsString()
  @Type(() => String)
  line1!: string;

  @IsString()
  @Type(() => String)
  city!: string;

  @IsString()
  @Type(() => String)
  country!: string;

  @IsString()
  @IsOptional()
  @Type(() => String)
  line2?: string | undefined;

  @IsString()
  @IsOptional()
  @Type(() => String)
  line3?: string | undefined;

  @IsString()
  @IsOptional()
  @Type(() => String)
  zipcode?: string | undefined;
}

class CompanyDto {
  @Type(() => LegalIdentityDto)
  @ValidateNested()
  legalIdentity!: LegalIdentityDto;
}

class HeadquarterDto {
  @Type(() => HeadquarterAddressDto)
  @ValidateNested()
  address!: HeadquarterAddressDto;
}

class AccountDto {
  @IsNumber()
  @Type(() => Number)
  accountTypeCode!: number;
}

class OnboardingRegistrationDataDto {
  @Type(() => CompanyDto)
  @ValidateNested()
  company!: CompanyDto;

  @Type(() => HeadquarterDto)
  @ValidateNested()
  headquarter!: HeadquarterDto;

  @Type(() => AccountDto)
  @ValidateNested()
  account!: AccountDto;
}

export class OnboardingRequestedEventPayloadDto extends EventPayloadDto {
  @Type(() => OnboardingRegistrationDataDto)
  @ValidateNested()
  registrationData!: OnboardingRegistrationDataDto;

  @IsString()
  @Type(() => String)
  onboardingRequestId!: string;
}
