import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class CreateAccountRequestDto {
  @ApiProperty({
    name: 'accountTypeCode',
    required: true,
    type: Number,
  })
  @IsNumber()
  accountTypeCode!: number;
}
