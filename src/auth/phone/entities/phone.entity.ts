import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';
import dayjs from 'dayjs';
import shortUUID from 'short-uuid';
import {
  BaseEntity,
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Phone extends BaseEntity {
  @PrimaryColumn()
  @ApiProperty({ example: shortUUID.generate() })
  @IsString()
  phoneId: string;

  @Column()
  @ApiProperty({ description: '전화번호', example: '010-9563-7570' })
  @IsString({ message: '반드시 문자열이여야 합니다.' })
  @Matches(/(010)-\d{3,4}-\d{4}/, { message: '올바른 전화번호가 아닙니다.' })
  phoneNo: string;

  @Column()
  @ApiProperty({ description: '인증번호', example: '030225' })
  @IsString()
  @MinLength(6)
  @MaxLength(6)
  verifyCode: string;

  @CreateDateColumn()
  @ApiProperty({ example: dayjs() })
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({ example: dayjs() })
  updatedAt: Date;

  @Column()
  @ApiProperty({ example: dayjs().add(3, 'hours') })
  expiredAt: Date;

  @Column({ nullable: true })
  revokedAt?: Date;

  @BeforeInsert()
  private generatePrimaryId() {
    this.phoneId = shortUUID.generate();
  }

  @BeforeInsert()
  private insertExpiredAt() {
    this.expiredAt = dayjs().add(3, 'hours').toDate();
  }
}
