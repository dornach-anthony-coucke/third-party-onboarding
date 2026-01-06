import { ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CreateCompanyRequestDto } from './create-company-request.dto.js';
import { CreateAccountRequestDto } from './create-account-request.dto.js';

export class CreateThirdPartyRequestDto {
  @ApiProperty({
    name: 'company',
    required: true,
    type: CreateCompanyRequestDto,
  })
  @ValidateNested()
  @Type(() => CreateCompanyRequestDto)
  company!: CreateCompanyRequestDto;

  @ApiProperty({
    name: 'account',
    required: true,
    type: CreateAccountRequestDto,
  })
  @ValidateNested()
  @Type(() => CreateAccountRequestDto)
  account!: CreateAccountRequestDto;
}
