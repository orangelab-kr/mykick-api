import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, IsUrl, Length } from 'class-validator';

export class ActivateRentDto {
  @ApiPropertyOptional({
    description: 'QR코드 주소',
    example: 'https://hikickride.page.link/T31Y',
  })
  @IsString()
  @IsUrl()
  @IsOptional()
  url?: string;

  @ApiPropertyOptional({
    description: '킥보드 코드',
    example: 'DE20KP',
  })
  @IsString()
  @Length(6, 6)
  @IsOptional()
  @Transform(({ value }) => value.toUpperCase())
  kickboardCode?: string;
}
