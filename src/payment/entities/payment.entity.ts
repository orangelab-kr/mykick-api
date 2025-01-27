import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
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
import { Card } from '../../card/entities/card.entity';
import { Rent } from '../../rent/entities/rent.entity';
import { User } from '../../user/entities/user.entity';

export enum PaymentType {
  Monthly = 'Monthly',
  Onetime = 'Onetime',
}

export interface PaymentItem {
  name: string;
  amount: number;
  type: PaymentType;
}

@Entity()
export class Payment extends BaseEntity {
  @PrimaryColumn()
  @ApiProperty({ example: shortUUID.generate() })
  @IsString()
  paymentId: string;

  @Column()
  @ApiProperty({ description: '결제된 금액(원)', example: 37500 })
  @IsInt({ message: '반드시 숫자여야 합니다.' })
  @Min(500, { message: '최소 500원부터 설정할 수 있습니다.' })
  @Max(1000000, { message: '최소 100만원을 초과할 수 없습니다.' })
  amount: number;

  @Column()
  @ApiProperty({ description: '결제 이름' })
  @IsString()
  name: string;

  @ManyToOne(() => User, (user) => user.payments, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Card, (card) => card.payments, {
    eager: true,
    onDelete: 'CASCADE',
  })
  card: Card;

  @ManyToOne(() => Rent, (rent) => rent.payments, { onDelete: 'CASCADE' })
  rent: Rent;

  @Column({
    type: 'json',
    array: false,
    default: () => "'[]'",
    nullable: false,
  })
  items: PaymentItem[];

  @Column()
  @IsString()
  token: string;

  @IsDate()
  @IsOptional()
  @Column({ nullable: true })
  @ApiPropertyOptional({
    example: dayjs(),
    description: '취소일',
  })
  cancelledAt?: Date;

  @IsDate()
  @ApiProperty({ example: dayjs() })
  @CreateDateColumn()
  createdAt: Date;

  @IsDate()
  @ApiProperty({ example: dayjs() })
  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  private generatePrimaryId() {
    this.paymentId = shortUUID.generate();
  }
}
