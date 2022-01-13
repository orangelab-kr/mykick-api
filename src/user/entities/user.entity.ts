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
export class User extends BaseEntity {
  @PrimaryColumn()
  @ApiProperty({ example: 'ikMCyxYHj2NLJ19dMqT2rf' })
  @IsString()
  userId: string;

  @Column()
  @ApiProperty({ description: '사용자 이름', example: '홍길동' })
  @IsString({ message: '반드시 문자열이여야 합니다.' })
  @MinLength(2, { message: '이름이 2자 이상이여야 합니다.' })
  @MaxLength(32, { message: '이름이 32자를 초과할 수 없습니다.' })
  name: string;

  @Column()
  @ApiProperty({ description: '전화번호', example: '010-9563-7570' })
  @IsString({ message: '반드시 문자열이여야 합니다.' })
  @Matches(/(010)-\d{3,4}-\d{4}/, { message: '올바른 전화번호가 아닙니다.' })
  phoneNo: string;

  @Column()
  @IsString({ message: '반드시 주소여야 합니다.' })
  @MinLength(2, { message: '주소는 2자 이상이여야 합니다.' })
  @MaxLength(100, { message: '주소가 100자를 초과할 수 없습니다.' })
  @ApiProperty({
    description: '주소',
    example: '서울 강남구 테헤란로78길 14-8 10층 (대치동)',
  })
  address: string;

  @ApiProperty({ example: dayjs() })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ example: dayjs() })
  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  private generatePrimaryId() {
    this.userId = shortUUID.generate();
  }
}