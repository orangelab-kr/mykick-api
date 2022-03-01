import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionModule } from '../session/session.module';
import { Token } from './entities/token.entity';
import { TokenService } from './token.service';

@Module({
  providers: [TokenService],
  exports: [TokenService],
  imports: [SessionModule, TypeOrmModule.forFeature([Token])],
})
export class TokenModule {}
