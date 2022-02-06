import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsUrl } from 'class-validator';

export class ActivateRentDto {
  @ApiPropertyOptional({
    description: 'QR코드 주소',
    example: 'https://hikickride.page.link/T31Y',
  })
  @IsString()
  @IsUrl()
  url: string;
}
