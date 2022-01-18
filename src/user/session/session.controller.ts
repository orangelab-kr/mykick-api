import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { User } from '../entities/user.entity';
import { UserDecorator } from '../user.decorator';
import { GetSessionsDto } from './dto/get-sessions.dto';
import { Session } from './entities/session.entity';
import { SessionService } from './session.service';

@Controller({ path: 'auth/sessions', version: '1' })
@ApiBearerAuth()
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Get()
  async findAll(
    @UserDecorator() user: User,
    @Query() query: GetSessionsDto,
  ): Promise<{ sessions: Session[]; total: number }> {
    return this.sessionService.getSessions(user, query);
  }
}
