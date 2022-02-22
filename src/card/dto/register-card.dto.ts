import { Transform } from 'class-transformer';
import { IsString, Length, MaxLength, MinLength } from 'class-validator';
import dayjs from 'dayjs';

export class RegisterCardDto {
  @IsString()
  @MinLength(14)
  @MaxLength(16)
  @Transform(({ value }) => value.replace(/-/g, ''))
  cardNumber: string;

  @IsString()
  @Transform(({ value }) => dayjs(value).format('YYYYMM'))
  expiry: string;

  @IsString()
  @Length(2)
  password: string;

  @IsString()
  @Transform(({ value }) => dayjs(value).format('YYMMDD'))
  birthday: string;
}
