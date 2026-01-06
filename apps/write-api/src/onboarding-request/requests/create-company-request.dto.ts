import { ApiProperty } from '@nestjs/swagger';
import { HeadquarterAddressDto } from './headquarter-address.dto.js';
import { CompanyLegalIdentityDto } from './company-legal-identity.dto.js';
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCompanyRequestDto {
  @ApiProperty({
    name: 'legalIdentity',
    required: true,
    type: CompanyLegalIdentityDto,
  })
  @Type(() => CompanyLegalIdentityDto)
  @ValidateNested()
  legalIdentity!: CompanyLegalIdentityDto;

  @ApiProperty({
    name: 'headquarterAddress',
    required: true,
    type: HeadquarterAddressDto,
  })
  @Type(() => HeadquarterAddressDto)
  @ValidateNested()
  headquarterAddress!: HeadquarterAddressDto;
}
