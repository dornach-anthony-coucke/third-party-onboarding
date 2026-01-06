import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

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

  @Type(() => HeadquarterAddressDto)
  @ValidateNested()
  headquarterAddress!: HeadquarterAddressDto;
}

class AccountDto {
  @IsNumber()
  @Type(() => Number)
  accountTypeCode!: number;
}

export class CreateOnboardingRequestMessagePayloadDto {
  @Type(() => CompanyDto)
  @ValidateNested()
  company!: CompanyDto;

  @Type(() => AccountDto)
  @ValidateNested()
  account!: AccountDto;
}
