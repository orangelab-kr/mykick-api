import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsOptional, IsString } from 'class-validator';
import crypto from 'crypto';
import dayjs from 'dayjs';
import shortUUID from 'short-uuid';
import { User } from '../../../user/entities/user.entity';
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

@Entity()
export class Token extends BaseEntity {
  @PrimaryColumn()
  @ApiProperty({ example: shortUUID.generate() })
  @IsString()
  tokenId: string;

  @ManyToOne(() => User, (user) => user.tokens, {
    eager: true,
    onDelete: 'CASCADE',
  })
  user: User;

  @Column()
  @ApiProperty()
  @IsString()
  code: string;

  @IsDate()
  @IsOptional()
  @Column({ nullable: true })
  @ApiPropertyOptional({
    example: dayjs().add(1, 'month'),
    description: '만료일',
  })
  expiredAt: Date;

  @ApiProperty({ example: dayjs() })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ example: dayjs() })
  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  private generatePrimaryId() {
    this.tokenId = shortUUID.generate();
  }

  @BeforeInsert()
  private generateToken() {
    this.code = crypto.randomBytes(32).toString('hex');
  }

  @BeforeInsert()
  private setExpiredAt() {
    this.expiredAt = dayjs().add(1, 'month').toDate();
  }
}
