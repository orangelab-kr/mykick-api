import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsEnum,
  IsString,
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
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Payment } from '../../payment/entities/payment.entity';
import { User } from '../../user/entities/user.entity';

export enum CardType {
  TOSS = 'TOSS',
}

@Entity()
export class Card extends BaseEntity {
  @PrimaryColumn()
  @ApiProperty({ example: shortUUID().generate() })
  @IsString()
  cardId: string;

  @Column()
  @ApiProperty({ description: '카드 이름', example: '토스로 결제' })
  @IsString({ message: '반드시 문자열이여야 합니다.' })
  @MinLength(2, { message: '이름이 2자 이상이여야 합니다.' })
  @MaxLength(32, { message: '이름이 32자를 초과할 수 없습니다.' })
  name: string;

  @Column({ type: 'enum', enum: CardType })
  @IsEnum(CardType)
  @ApiProperty({
    description: '결제 수단',
    example: CardType.TOSS,
    enum: CardType,
  })
  type: CardType;

  @Column({ select: false })
  @ApiProperty({ description: '빌링키', example: shortUUID.generate() })
  @IsString()
  billingKey: string;

  @ManyToOne(() => User, (user) => user.cards, {
    eager: true,
    onDelete: 'CASCADE',
  })
  user: User;

  @OneToMany(() => Payment, (payment) => payment.user, { onDelete: 'CASCADE' })
  payments: Payment[];

  @IsDate()
  @ApiProperty({ description: '카드 등록일자', example: dayjs() })
  @CreateDateColumn()
  createdAt: Date;

  @IsDate()
  @ApiProperty({ example: dayjs() })
  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  private generatePrimaryId() {
    this.cardId = shortUUID.generate();
  }
}
