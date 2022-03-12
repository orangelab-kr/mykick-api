import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import _ from 'lodash';
import { MoreThan, Repository } from 'typeorm';
import { Opcode } from '../../common/opcode';
import { User } from '../../user/entities/user.entity';
import { Token } from './entities/token.entity';

@Injectable()
export class TokenService {
  constructor(
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
  ) {}

  public readonly url = _.get(
    process.env,
    'MYKICK_URL',
    'https://my.hikick.kr',
  );

  async generateUrl(user: User, url: string): Promise<string> {
    const { code } = await this.createToken(user);
    const params = new URLSearchParams({ code, url });
    return `${this.url}/auth/token?${params.toString()}`;
  }

  async getUserByCode(code: string): Promise<User> {
    const expiredAt = MoreThan(new Date());
    const token = await this.tokenRepository.findOne({ code, expiredAt });
    if (!token) throw Opcode.InvalidSession();
    return token.user;
  }

  async revokeByUser(user: User): Promise<void> {
    await this.tokenRepository.delete({ user });
  }

  async createToken(user: User): Promise<Token> {
    const latestToken = await this.getLatestToken(user);
    if (latestToken) return latestToken;
    return this.generateToken(user);
  }

  async getLatestToken(user: User): Promise<Token | undefined> {
    const expiredAt = MoreThan(new Date());
    return this.tokenRepository.findOne({
      order: { createdAt: -1 },
      where: { user, expiredAt },
    });
  }

  generateToken(user: User): Promise<Token> {
    const token = new Token();
    token.user = user;
    return token.save();
  }
}
