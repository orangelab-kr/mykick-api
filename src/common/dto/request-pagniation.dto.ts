import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional } from 'class-validator';

export class RequestPagniationDto {
  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  @IsOptional()
  @IsInt({ message: '반드시 숫자여야 합니다.' })
  @ApiPropertyOptional({ description: '가져올 갯수', example: 10 })
  take?: number = 10;

  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  @IsOptional()
  @IsInt({ message: '반드시 숫자여야 합니다.' })
  @ApiPropertyOptional({ description: '넘어갈 갯수', example: 0 })
  skip?: number = 0;
}
