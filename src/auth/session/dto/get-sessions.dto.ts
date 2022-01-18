import { IntersectionType } from '@nestjs/swagger';
import { RequestOrderByDto } from '../../../common/dto/request-order-by.dto';
import { RequestPagniationDto } from '../../../common/dto/request-pagniation.dto';
import { RequestSearchDto } from '../../../common/dto/request-search.dto';
import { Session } from '../entities/session.entity';

export class GetSessionsDto extends IntersectionType(
  IntersectionType(RequestPagniationDto, RequestSearchDto),
  class extends RequestOrderByDto<
    Session,
    'usedAt' | 'createdAt' | 'updatedAt'
  > {},
) {}
