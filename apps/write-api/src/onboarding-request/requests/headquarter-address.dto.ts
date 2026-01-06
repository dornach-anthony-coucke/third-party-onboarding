import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString, IsOptional, IsString } from 'class-validator';

export class HeadquarterAddressDto {
  @ApiProperty({
    name: 'line1',
    required: true,
    type: String,
  })
  @IsString()
  line1!: string;

  @ApiProperty({
    name: 'line2',
    required: false,
    type: String,
  })
  @IsString()
  @IsOptional()
  line2?: string;

  @ApiProperty({
    name: 'line3',
    required: false,
    type: String,
  })
  @IsString()
  @IsOptional()
  line3?: string;

  @ApiProperty({
    name: 'country',
    required: true,
    type: String,
  })
  @IsString()
  country!: string;

  @ApiProperty({
    name: 'city',
    required: true,
    type: String,
  })
  @IsString()
  city!: string;

  @ApiProperty({
    name: 'zipCode',
    required: false,
    type: String,
  })
  @IsString()
  @IsNumberString()
  zipCode?: string;
}
