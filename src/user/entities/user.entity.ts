import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import dayjs from 'dayjs';
import shortUUID from 'short-uuid';
import {
  BaseEntity,
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Card } from '../../card/entities/card.entity';
import { Payment } from '../../payment/entities/payment.entity';
import { Rent } from '../../rent/entities/rent.entity';
import { Session } from '../../auth/session/entities/session.entity';

@Entity()
export class User extends BaseEntity {
  @PrimaryColumn()
  @ApiProperty({ example: shortUUID.generate() })
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

  @IsUrl()
  @IsOptional()
  @Column({ nullable: true, select: false })
  @ApiPropertyOptional({
    description: '신분증 이미지',
    example: 'https://cdn.hikick.kr/images/THIS_IS_MY_IMAGE.jpg?k=asd',
  })
  idcard?: string;

  @OneToMany(() => Session, (session) => session.user)
  sessions: Session[];

  @OneToMany(() => Card, (card) => card.user)
  cards: Card[];

  @OneToMany(() => Payment, (payment) => payment.user)
  payments: Payment[];

  @OneToMany(() => Rent, (rent) => rent.user)
  rents: Rent[];

  @CreateDateColumn()
  @ApiProperty({ example: dayjs() })
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({ example: dayjs() })
  updatedAt: Date;

  @BeforeInsert()
  private generatePrimaryId() {
    this.userId = shortUUID.generate();
  }
}
