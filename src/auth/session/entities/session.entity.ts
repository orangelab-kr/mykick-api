import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsString } from 'class-validator';
import crypto from 'crypto';
import dayjs from 'dayjs';
import shortUUID from 'short-uuid';
import {
  BaseEntity,
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../../user/entities/user.entity';

@Entity()
export class Session extends BaseEntity {
  @PrimaryColumn()
  @IsString()
  sessionId: string;

  @Column({ select: false })
  @ApiProperty({ description: '인증 토큰' })
  @IsString()
  token: string;

  @Column()
  @ApiProperty({ description: '유저 에이전트', default: 'Mozilla/5.0' })
  @IsString()
  userAgent: string;

  @ManyToOne(() => User, (user) => user.sessions, {
    eager: true,
    onDelete: 'CASCADE',
  })
  user: User;

  @Column()
  @ApiProperty({ description: '마지막 사용일자', example: dayjs() })
  @IsDate()
  usedAt: Date;

  @IsDate()
  @ApiProperty({ description: '회원가입 일자', example: dayjs() })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ example: dayjs() })
  @IsDate()
  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  private generatePrimaryId() {
    this.sessionId = shortUUID.generate();
  }

  @BeforeInsert()
  private generateToken() {
    this.token = crypto.randomBytes(95).toString('base64');
  }

  @BeforeInsert()
  private setDefaultUsedAt() {
    this.usedAt = new Date();
  }
}
