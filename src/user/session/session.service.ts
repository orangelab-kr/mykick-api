import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Like, Repository } from 'typeorm';
import { Opcode } from '../../common/opcode';
import { User } from '../entities/user.entity';
import { CreateSessionDto } from './dto/create-session.dto';
import { GetSessionsDto } from './dto/get-sessions.dto';
import { Session } from './entities/session.entity';

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);

  constructor(
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
  ) {}

  async create(user: User, payload: CreateSessionDto): Promise<Session> {
    const { userAgent } = payload;
    this.logger.log(
      `${user.name}(${user.userId}) has created a new session for ${userAgent}.`,
    );

    return this.sessionRepository.create({ user, userAgent }).save();
  }

  async getSessions(
    user: User,
    payload: GetSessionsDto,
  ): Promise<{ sessions: Session[]; total: number }> {
    const { orderBy, search, take, skip } = payload;
    const find: FindManyOptions<Session> = {
      where: { user },
      order: { usedAt: 'DESC' },
    };

    if (orderBy) find.order = orderBy;
    if (take) find.take = take;
    if (skip) find.skip = skip;
    if (search) find.where = [{ userAgent: Like(search) }];
    const [sessions, total] = await this.sessionRepository.findAndCount(find);
    return { sessions, total };
  }

  async get(user: User, sessionId: string): Promise<Session | null> {
    return this.sessionRepository.findOne({ user, sessionId });
  }

  async getOrThrow(user: User, sessionId: string): Promise<Session> {
    const session = await this.get(user, sessionId);
    if (!session) throw Opcode.InvalidSession();
    return session;
  }

  async getByToken(token: string): Promise<Session | null> {
    return this.sessionRepository.findOne({ token });
  }

  async getTokenOrThrow(token: string): Promise<Session> {
    const session = await this.getByToken(token);
    if (!session) throw Opcode.InvalidSession();
    return session;
  }

  async revoke(session: Session) {
    await session.remove();
    this.logger.log(
      `${session.userAgent}(${session.sessionId}) has been revoke session.`,
    );
  }

  async revokeAll(user: User) {
    const { affected } = await this.sessionRepository.delete({ user });
    this.logger.log(
      `${user.name}(${user.userId}) has been revoke all sessions. (${affected})`,
    );
  }
}
