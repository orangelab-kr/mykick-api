import { Transform } from 'class-transformer';
import { Equals, IsArray, IsBoolean, IsString } from 'class-validator';
import dayjs, { Dayjs } from 'dayjs';

export class InternalJwtDto {
  @IsString()
  @Equals('mykick')
  sub: string;

  @IsString()
  iss: string;

  @IsString()
  aud: string;

  @IsArray()
  @IsBoolean({ each: true })
  @Transform((prs) =>
    parseInt(prs.key, 36)
      .toString(2)
      .padStart(128, '0')
      .split('')
      .reverse()
      .map((v) => v === '1'),
  )
  prs: string;

  @Transform((date) => dayjs(date.value))
  iat: Dayjs;

  @Transform((date) => dayjs(date.value))
  exp: Dayjs;
}
