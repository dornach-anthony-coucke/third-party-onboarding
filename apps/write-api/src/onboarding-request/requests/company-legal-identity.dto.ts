import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CompanyLegalIdentityDto {
  @ApiProperty({
    name: 'legalName',
    required: true,
    type: String,
  })
  @IsString()
  legalName!: string;

  @ApiProperty({
    name: 'legalId',
    required: false,
    type: String,
  })
  @IsString()
  @IsOptional()
  legalId?: string;

  @ApiProperty({
    name: 'legalForm',
    required: false,
    type: String,
  })
  @IsString()
  @IsOptional()
  legalForm?: string;
}
