import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class RequestSearchDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: '검색' })
  search?: string;
}
